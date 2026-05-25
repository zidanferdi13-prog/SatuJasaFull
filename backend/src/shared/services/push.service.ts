import prisma from '../../config/prisma';
import logger from '../logger';

interface PushMessage {
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

const expoPushUrl = 'https://exp.host/--/api/v2/push/send';

const isExpoPushToken = (token: string) => token.startsWith('ExponentPushToken[') || token.startsWith('ExpoPushToken[');

export const registerDeviceToken = async (
  tenantId: string,
  userId: string,
  token: string,
  platform: string,
  deviceId?: string
) => {
  if (!isExpoPushToken(token)) {
    throw Object.assign(new Error('Invalid Expo push token'), { statusCode: 400 });
  }

  return prisma.userDeviceToken.upsert({
    where: { token },
    create: { tenantId, userId, token, platform, deviceId, isActive: true },
    update: { tenantId, userId, platform, deviceId, isActive: true },
  });
};

export const sendPushToUsers = async (tenantId: string, userIds: string[], message: PushMessage) => {
  const tokens = await prisma.userDeviceToken.findMany({
    where: { tenantId, userId: { in: userIds }, isActive: true },
    select: { token: true },
  });

  if (!tokens.length) return { sent: 0 };

  const payload = tokens.map(({ token }) => ({
    to: token,
    sound: 'default',
    title: message.title,
    body: message.body,
    data: message.data ?? {},
  }));

  const response = await fetch(expoPushUrl, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-Encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const result = await response.text();
  if (!response.ok) {
    logger.error(`[PUSH FAILED] ${response.status}: ${result}`);
    throw new Error(`Expo push failed: ${response.status}`);
  }

  return { sent: tokens.length };
};
