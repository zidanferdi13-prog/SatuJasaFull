import { MessageTemplates } from '../utils/messages';

interface QueuedMessage {
  id: string;
  type: 'receipt' | 'stage_update';
  phone: string;
  message: string;
  customerId: string;
  transactionId: string;
  retries: number;
  createdAt: Date;
}

export class NotificationService {
  private static messageQueue: QueuedMessage[] = [];

  static async sendReceipt(
    phone: string,
    customerName: string,
    serviceName: string,
    amount: number,
    trackingUrl: string,
    customerId: string,
    transactionId: string,
  ): Promise<boolean> {
    const message = MessageTemplates.receiptMessage(customerName, serviceName, amount, trackingUrl);

    const queued: QueuedMessage = {
      id: `receipt_${transactionId}_${Date.now()}`,
      type: 'receipt',
      phone,
      message,
      customerId,
      transactionId,
      retries: 0,
      createdAt: new Date(),
    };

    this.messageQueue.push(queued);

    try {
      await this.sendWhatsAppMessage(phone, message);
      console.log(`✓ Receipt sent to ${phone}`);
      return true;
    } catch (error) {
      console.error(`✗ Failed to send receipt to ${phone}:`, error);
      return false;
    }
  }

  static async sendStageUpdate(
    phone: string,
    customerName: string,
    stage: number,
    stageName: string,
    customerId: string,
    transactionId: string,
  ): Promise<boolean> {
    const message = MessageTemplates.stageUpdateMessage(customerName, stage.toString(), stageName);

    const queued: QueuedMessage = {
      id: `update_${transactionId}_${stage}_${Date.now()}`,
      type: 'stage_update',
      phone,
      message,
      customerId,
      transactionId,
      retries: 0,
      createdAt: new Date(),
    };

    this.messageQueue.push(queued);

    try {
      await this.sendWhatsAppMessage(phone, message);
      console.log(`✓ Stage update sent to ${phone}`);
      return true;
    } catch (error) {
      console.error(`✗ Failed to send stage update to ${phone}:`, error);
      return false;
    }
  }

  private static async sendWhatsAppMessage(phone: string, message: string): Promise<void> {
    const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
    const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
    const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER;

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_NUMBER) {
      console.warn(
        '⚠️ WhatsApp not configured. Message queued but not sent. Configure Twilio credentials in .env to enable WhatsApp',
      );
      return;
    }

    const Twilio = require('twilio');
    const client = new Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

    const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;

    const response = await client.messages.create({
      from: `whatsapp:${TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${formattedPhone}`,
      body: message,
    });

    if (!response.sid) {
      throw new Error('Failed to send WhatsApp message');
    }
  }

  static getQueueStatus(): { total: number; queued: QueuedMessage[] } {
    return {
      total: this.messageQueue.length,
      queued: this.messageQueue,
    };
  }

  static clearQueue(): void {
    this.messageQueue = [];
  }
}
