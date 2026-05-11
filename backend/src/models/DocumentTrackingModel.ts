import { Database } from '../config/database';
import { DocumentTracking } from '../types';

export class DocumentTrackingModel {
  static async create(
    transactionId: string,
    bureauId: string,
    customerId: string,
  ): Promise<DocumentTracking | null> {
    const result = await Database.query(
      `INSERT INTO document_tracking (transaction_id, bureau_id, customer_id, current_stage, tracking_token)
       VALUES ($1, $2, $3, 1, uuid_generate_v4())
       RETURNING id, transaction_id, bureau_id, customer_id, current_stage, tracking_token, created_at, updated_at`,
      [transactionId, bureauId, customerId],
    );
    return result.rows[0] || null;
  }

  static async findByToken(token: string): Promise<any | null> {
    const result = await Database.query(
      `SELECT
        dt.id, dt.transaction_id, dt.bureau_id, dt.customer_id, dt.current_stage, dt.tracking_token,
        t.service_id, s.name as service_name,
        c.name as customer_name, CONCAT(SUBSTRING(c.phone, 1, LENGTH(c.phone)-4), 'xxxx') as customer_phone,
        dt.created_at, dt.updated_at
       FROM document_tracking dt
       JOIN transactions t ON dt.transaction_id = t.id
       JOIN services s ON t.service_id = s.id
       JOIN customers c ON dt.customer_id = c.id
       WHERE dt.tracking_token = $1`,
      [token],
    );
    return result.rows[0] || null;
  }

  static async findByTransaction(transactionId: string, bureauId: string): Promise<DocumentTracking | null> {
    const result = await Database.query(
      `SELECT id, transaction_id, bureau_id, customer_id, current_stage, tracking_token, created_at, updated_at
       FROM document_tracking WHERE transaction_id = $1 AND bureau_id = $2`,
      [transactionId, bureauId],
    );
    return result.rows[0] || null;
  }

  static async updateStage(
    documentId: string,
    bureauId: string,
    newStage: number,
    notes?: string,
  ): Promise<DocumentTracking | null> {
    if (newStage < 1 || newStage > 5) {
      throw new Error('Invalid stage number');
    }

    const result = await Database.query(
      `UPDATE document_tracking SET current_stage = $1, updated_at = NOW()
       WHERE id = $2 AND bureau_id = $3
       RETURNING id, transaction_id, bureau_id, customer_id, current_stage, tracking_token, created_at, updated_at`,
      [newStage, documentId, bureauId],
    );

    if (result.rows[0]) {
      await Database.query(
        `INSERT INTO document_stage_history (document_tracking_id, stage, notes)
         VALUES ($1, $2, $3)`,
        [documentId, newStage, notes || null],
      );
    }

    return result.rows[0] || null;
  }

  static async getHistory(documentId: string): Promise<any[]> {
    const result = await Database.query(
      `SELECT id, document_tracking_id, stage, notes, created_at
       FROM document_stage_history WHERE document_tracking_id = $1
       ORDER BY created_at ASC`,
      [documentId],
    );
    return result.rows;
  }

  static async getStageHistory(documentId: string): Promise<any[]> {
    const result = await Database.query(
      `SELECT stage, notes, created_at FROM document_stage_history
       WHERE document_tracking_id = $1 ORDER BY created_at ASC`,
      [documentId],
    );
    return result.rows;
  }
}
