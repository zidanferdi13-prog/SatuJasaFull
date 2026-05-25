import 'dotenv/config';
import { initializeSentry } from './config/sentry';
import app from './app';
import prisma from './config/prisma';
import { initializeWhatsAppWorker } from './shared/services/whatsapp.service';
import { initializeJobScheduler } from './jobs/scheduler';
import logger from './shared/logger';

const PORT = process.env.PORT || 3000;

initializeSentry();

const startServer = async () => {
  try {
    // Test DB connection
    await prisma.$queryRaw`SELECT 1`;
    logger.info('✓ Database connected');

    // Start WhatsApp worker
    initializeWhatsAppWorker();
    logger.info('✓ WhatsApp worker initialized');

    await initializeJobScheduler();

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
