import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import prisma from '../../config/prisma';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

export const whatsappQueue = new Queue('whatsapp-notifications', { connection });

export const initializeWorker = () => {
  const worker = new Worker(
    'whatsapp-notifications',
    async (job: Job) => {
      const { phone, message, mediaUrl } = job.data;

      const dbRecord = await prisma.whatsappQueue.create({
        data: { phone, message, mediaUrl, status: 'PENDING' }
      });

      try {
        // TODO: Replace with actual Twilio/WhatsApp API call
        console.log(`[WA SENT] To: ${phone} | Message: ${message.substring(0, 50)}...`);

        await prisma.whatsappQueue.update({
          where: { id: dbRecord.id },
          data: { status: 'SENT', updatedAt: new Date() }
        });

        return { success: true, to: phone };
      } catch (error: any) {
        await prisma.whatsappQueue.update({
          where: { id: dbRecord.id },
          data: { status: 'FAILED', error: error.message, attempts: { increment: 1 }, updatedAt: new Date() }
        });
        throw error;
      }
    },
    {
      connection,
      concurrency: 5,
      limiter: { max: 10, duration: 1000 }
    }
  );

  worker.on('failed', (job, err) => {
    console.error(`[WA FAILED] Job ${job?.id}: ${err.message}`);
  });

  return worker;
};

export const enqueueWhatsApp = async (phone: string, message: string, mediaUrl?: string) => {
  await whatsappQueue.add(
    'send',
    { phone, message, mediaUrl },
    { attempts: 5, backoff: { type: 'exponential', delay: 5000 } }
  );
};
