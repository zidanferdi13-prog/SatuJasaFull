import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import prisma from '../../config/prisma';
import logger from '../logger';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

export const whatsappQueue = new Queue('whatsapp-notifications', { connection });

export const enqueueWhatsApp = async (
  tenantId: string,
  phone: string,
  message: string,
  mediaUrl?: string
) => {
  // Insert DB record first
  const record = await prisma.whatsappQueue.create({
    data: { tenantId, phone, message, mediaUrl, status: 'PENDING' },
  });

  await whatsappQueue.add(
    'send',
    { id: record.id, phone, message, mediaUrl },
    { attempts: 5, backoff: { type: 'exponential', delay: 5000 } }
  );
};

export const initializeWhatsAppWorker = () => {
  const worker = new Worker(
    'whatsapp-notifications',
    async (job: Job) => {
      const { id, phone, message } = job.data;

      try {
        // TODO: Replace with actual WhatsApp API integration
        // For MVP, log and mark as sent
        logger.info(`[WA] To: ${phone} | ${message.substring(0, 60)}`);

        if (process.env.WHATSAPP_API_URL && process.env.WHATSAPP_API_KEY) {
          // Placeholder for real integration
          // await axios.post(process.env.WHATSAPP_API_URL, { phone, message }, {
          //   headers: { 'x-api-key': process.env.WHATSAPP_API_KEY }
          // });
        }

        await prisma.whatsappQueue.update({
          where: { id },
          data: { status: 'SENT', attempts: job.attemptsMade + 1 },
        });
      } catch (error: any) {
        await prisma.whatsappQueue.update({
          where: { id },
          data: {
            status: 'FAILED',
            error: error.message,
            attempts: { increment: 1 },
          },
        });
        throw error; // rethrow so BullMQ handles retry
      }
    },
    { connection, concurrency: 5, limiter: { max: 10, duration: 1000 } }
  );

  worker.on('failed', (job, err) => {
    logger.error(`[WA FAILED] Job ${job?.id}: ${err.message}`);
  });

  return worker;
};
