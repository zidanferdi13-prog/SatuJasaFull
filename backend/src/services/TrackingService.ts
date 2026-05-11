import { DocumentTrackingModel } from '../models/DocumentTrackingModel';
import { DocumentTracking } from '../types';

const STAGE_NAMES = {
  1: 'Dokumen Diterima',
  2: 'Verifikasi',
  3: 'Processing',
  4: 'Ready Ambil',
  5: 'Completed',
};

export class TrackingService {
  static async createTracking(transactionId: string, bureauId: string, customerId: string): Promise<DocumentTracking | null> {
    return DocumentTrackingModel.create(transactionId, bureauId, customerId);
  }

  static async getStatus(token: string): Promise<any> {
    const tracking = await DocumentTrackingModel.findByToken(token);

    if (!tracking) {
      throw new Error('Tracking information not found');
    }

    const stageName = STAGE_NAMES[tracking.current_stage as keyof typeof STAGE_NAMES];

    return {
      service: tracking.service_name,
      customer: tracking.customer_name,
      customer_phone: tracking.customer_phone,
      current_stage: tracking.current_stage,
      stage_name: stageName,
      updated_at: tracking.updated_at,
    };
  }

  static async getHistory(token: string): Promise<any> {
    const tracking = await DocumentTrackingModel.findByToken(token);

    if (!tracking) {
      throw new Error('Tracking information not found');
    }

    const history = await DocumentTrackingModel.getStageHistory(tracking.id);

    return {
      service: tracking.service_name,
      customer: tracking.customer_name,
      current_stage: tracking.current_stage,
      stage_name: STAGE_NAMES[tracking.current_stage as keyof typeof STAGE_NAMES],
      history: history.map((h: any) => ({
        stage: h.stage,
        stage_name: STAGE_NAMES[h.stage as keyof typeof STAGE_NAMES],
        notes: h.notes,
        updated_at: h.created_at,
      })),
    };
  }

  static async updateStage(documentId: string, bureauId: string, newStage: number, notes?: string): Promise<any> {
    const updated = await DocumentTrackingModel.updateStage(documentId, bureauId, newStage, notes);

    if (!updated) {
      throw new Error('Document not found');
    }

    return {
      id: updated.id,
      current_stage: updated.current_stage,
      stage_name: STAGE_NAMES[updated.current_stage as keyof typeof STAGE_NAMES],
      updated_at: updated.updated_at,
    };
  }

  static getStageNames() {
    return STAGE_NAMES;
  }
}
