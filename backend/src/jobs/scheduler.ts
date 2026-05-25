import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { env } from '../config/env';
import { runSubscriptionExpiryJob } from './subscription-expiry.job';
import { runOverdueTransactionJob } from './overdue-transaction.job';
import { runStnkExpiryJob } from './stnk-expiry.job';
import logger from '../shared/logger';

const connection = new IORedis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

const jobQueue = new Queue('daily-jobs', { connection });

const handlers: Record<string, () => Promise<void>> = {
  'subscription-expiry': runSubscriptionExpiryJob,
  'overdue-transactions': runOverdueTransactionJob,
  'stnk-expiry': runStnkExpiryJob,
};

export const initializeJobScheduler = async () => {
  await jobQueue.upsertJobScheduler(
    'subscription-expiry-daily',
    { pattern: '0 2 * * *' },
    { name: 'subscription-expiry', data: {} }
  );
  await jobQueue.upsertJobScheduler(
    'overdue-transactions-daily',
    { pattern: '0 3 * * *' },
    { name: 'overdue-transactions', data: {} }
  );
  await jobQueue.upsertJobScheduler(
    'stnk-expiry-daily',
    { pattern: '0 8 * * *' },
    { name: 'stnk-expiry', data: {} }
  );

  const worker = new Worker(
    'daily-jobs',
    async (job: Job) => {
      const handler = handlers[job.name];
      if (!handler) throw new Error(`Unknown scheduled job: ${job.name}`);

      logger.info(`[JOB] Running scheduled job ${job.name}`);
      await handler();
    },
    { connection, concurrency: 1 }
  );

  worker.on('failed', (job, err) => {
    logger.error(`[JOB FAILED] ${job?.name}: ${err.message}`);
  });

  logger.info('✓ Daily job scheduler initialized');
  return worker;
};
