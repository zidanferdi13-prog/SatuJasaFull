import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import prisma from '../config/prisma';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

export const whatsappQueue = new Queue('whatsapp-notifications', { connection });

export const whatsappWorker = new Worker(
  'whatsapp-notifications',
  async (job) => {
    const { phone, message, mediaUrl, tenantId } = job.data;

    // Create queue record in DB
    const dbRecord = await prisma.whatsappQueue.create({
      data: { phone, message, mediaUrl, status: 'PENDING' }
    });

    try {
      console.log(`Sending WA to ${phone}: ${message}`);
      // Integrate with Twilio or another WA API provider here
      // await twilioClient.messages.create({ ... })

      await prisma.whatsappQueue.update({
        where: { id: dbRecord.id },
        data: { status: 'SENT', updatedAt: new Date() }
      });
    } catch (error: any) {
      await prisma.whatsappQueue.update({
        where: { id: dbRecord.id },
        data: {
          status: 'FAILED',
          error: error.message,
          attempts: { increment: 1 },
          updatedAt: new Date()
        }
      });
      throw error;
    }
  },
  {
    connection,
    limiter: { max: 10, duration: 1000 } // 10 messages per second
  }
);
