import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import prisma from '../../config/prisma';
import { env } from '../../config/env';
import logger from '../logger';

const connection = new IORedis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

export const whatsappQueue = new Queue('whatsapp-notifications', { connection });

export const enqueueWhatsApp = async (
  tenantId: string,
  phone: string,
  message: string,
  mediaUrl?: string
) => {
  const record = await prisma.whatsappQueue.create({
    data: { tenantId, phone, message, mediaUrl, status: 'PENDING' },
  });

  await whatsappQueue.add(
    'send',
    { id: record.id, phone, message, mediaUrl },
    { attempts: 5, backoff: { type: 'exponential', delay: 5000 } }
  );
};

const postForm = async (url: string, body: URLSearchParams, headers: Record<string, string>) => {
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body,
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`WhatsApp provider returned ${response.status}: ${text}`);
  }

  return text;
};

const sendViaFonnte = async (phone: string, message: string, mediaUrl?: string) => {
  const token = env.WHATSAPP_API_TOKEN ?? env.WHATSAPP_API_KEY;
  if (!env.WHATSAPP_API_URL || !token) {
    throw new Error('WHATSAPP_API_URL and WHATSAPP_API_TOKEN are required for Fonnte');
  }

  const body = new URLSearchParams({ target: phone, message });
  if (mediaUrl) body.set('url', mediaUrl);

  return postForm(env.WHATSAPP_API_URL, body, { Authorization: token });
};

const sendViaWablas = async (phone: string, message: string, mediaUrl?: string) => {
  const token = env.WHATSAPP_API_TOKEN ?? env.WHATSAPP_API_KEY;
  if (!env.WHATSAPP_API_URL || !token) {
    throw new Error('WHATSAPP_API_URL and WHATSAPP_API_TOKEN are required for Wablas');
  }

  const body = new URLSearchParams({ phone, message });
  if (mediaUrl) body.set('image', mediaUrl);

  return postForm(env.WHATSAPP_API_URL, body, { Authorization: token });
};

const sendWhatsApp = async (phone: string, message: string, mediaUrl?: string) => {
  if (env.WHATSAPP_PROVIDER === 'none') {
    logger.info(`[WA:dry-run] To: ${phone} | ${message.substring(0, 60)}`);
    return;
  }

  if (env.WHATSAPP_PROVIDER === 'fonnte') {
    await sendViaFonnte(phone, message, mediaUrl);
    return;
  }

  await sendViaWablas(phone, message, mediaUrl);
};

export const initializeWhatsAppWorker = () => {
  const worker = new Worker(
    'whatsapp-notifications',
    async (job: Job) => {
      const { id, phone, message, mediaUrl } = job.data;

      try {
        await sendWhatsApp(phone, message, mediaUrl);

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
        throw error;
      }
    },
    { connection, concurrency: 5, limiter: { max: 10, duration: 1000 } }
  );

  worker.on('failed', (job, err) => {
    logger.error(`[WA FAILED] Job ${job?.id}: ${err.message}`);
  });

  return worker;
};
