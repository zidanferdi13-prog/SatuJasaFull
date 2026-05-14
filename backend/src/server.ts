import 'dotenv/config';
import app from './app';
import prisma from './config/prisma';
import { initializeWhatsAppWorker } from './shared/services/whatsapp.service';
import { runSubscriptionExpiryJob } from './jobs/subscription-expiry.job';
import { runOverdueTransactionJob } from './jobs/overdue-transaction.job';
import logger from './shared/logger';

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Test DB connection
    await prisma.$queryRaw`SELECT 1`;
    logger.info('✓ Database connected');

    // Start WhatsApp worker
    initializeWhatsAppWorker();
    logger.info('✓ WhatsApp worker initialized');

    // Schedule daily jobs using simple interval (production would use cron)
    const runDailyJobs = async () => {
      await runSubscriptionExpiryJob().catch((e) => logger.error('[JOB ERROR]', e));
      await runOverdueTransactionJob().catch((e) => logger.error('[JOB ERROR]', e));
    };

    // Run once on startup, then every 24 hours
    runDailyJobs();
    setInterval(runDailyJobs, 24 * 60 * 60 * 1000);

    app.listen(PORT, () => {
      logger.info(`✓ Server running on port ${PORT}`);
      logger.info(`  API: http://localhost:${PORT}/api/v1`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
