import { Database } from '../config/database';
import { Transaction } from '../types';

export class TransactionModel {
  static async create(
    bureauId: string,
    customerId: string,
    serviceId: string,
    basePrice: number,
    marginAmount: number,
    finalPrice: number,
    paymentMethod: string = 'CASH',
  ): Promise<Transaction | null> {
    const result = await Database.query(
      `INSERT INTO transactions (bureau_id, customer_id, service_id, base_price, margin_amount, final_price, payment_method, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'PENDING')
       RETURNING id, bureau_id, customer_id, service_id, base_price, margin_amount, final_price, status, payment_method, payment_status, created_at, updated_at`,
      [bureauId, customerId, serviceId, basePrice, marginAmount, finalPrice, paymentMethod],
    );
    return result.rows[0] || null;
  }

  static async findById(id: string, bureauId: string): Promise<any | null> {
    const result = await Database.query(
      `SELECT t.*, c.name as customer_name, c.phone as customer_phone, s.name as service_name, b.name as bureau_name
       FROM transactions t
       JOIN customers c ON t.customer_id = c.id
       JOIN services s ON t.service_id = s.id
       JOIN bureaus b ON t.bureau_id = b.id
       WHERE t.id = $1 AND t.bureau_id = $2`,
      [id, bureauId],
    );
    return result.rows[0] || null;
  }

  static async list(
    bureauId: string,
    limit: number = 20,
    offset: number = 0,
    status?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<any[]> {
    let query = `
      SELECT t.*, c.name as customer_name, c.phone as customer_phone, s.name as service_name
      FROM transactions t
      JOIN customers c ON t.customer_id = c.id
      JOIN services s ON t.service_id = s.id
      WHERE t.bureau_id = $1
    `;
    const params: any[] = [bureauId];
    let paramIndex = 2;

    if (status) {
      query += ` AND t.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (startDate) {
      query += ` AND t.created_at >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      query += ` AND t.created_at <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    query += ` ORDER BY t.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await Database.query(query, params);
    return result.rows;
  }

  static async updateStatus(id: string, bureauId: string, status: string): Promise<Transaction | null> {
    const result = await Database.query(
      `UPDATE transactions SET status = $1, updated_at = NOW(), completed_at = CASE WHEN $1 = 'COMPLETED' THEN NOW() ELSE completed_at END
       WHERE id = $2 AND bureau_id = $3
       RETURNING id, bureau_id, customer_id, service_id, base_price, margin_amount, final_price, status, payment_method, payment_status, created_at, updated_at`,
      [status, id, bureauId],
    );
    return result.rows[0] || null;
  }

  static async count(bureauId: string): Promise<number> {
    const result = await Database.query(`SELECT COUNT(*) as count FROM transactions WHERE bureau_id = $1`, [bureauId]);
    return parseInt(result.rows[0]?.count || 0);
  }

  static async dailyTotal(bureauId: string, date: Date): Promise<any> {
    const result = await Database.query(
      `SELECT
        COUNT(*) as transaction_count,
        SUM(final_price) as total_revenue,
        SUM(margin_amount) as total_margin
       FROM transactions
       WHERE bureau_id = $1 AND DATE(created_at) = $2 AND status = 'COMPLETED'`,
      [bureauId, date],
    );
    return result.rows[0];
  }
}
