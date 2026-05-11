import { Database } from '../config/database';
import { Service } from '../types';

export class ServiceModel {
  static async findById(id: string, bureauId: string): Promise<Service | null> {
    const result = await Database.query(
      `SELECT id, bureau_id, name, base_price, margin_percentage, active, created_at
       FROM services WHERE id = $1 AND bureau_id = $2`,
      [id, bureauId],
    );
    return result.rows[0] || null;
  }

  static async listByBureau(bureauId: string, activeOnly: boolean = true): Promise<Service[]> {
    let query = `SELECT id, bureau_id, name, base_price, margin_percentage, active, created_at
                 FROM services WHERE bureau_id = $1`;
    const params: any[] = [bureauId];

    if (activeOnly) {
      query += ` AND active = true`;
    }

    query += ` ORDER BY created_at ASC`;

    const result = await Database.query(query, params);
    return result.rows;
  }

  static async create(
    bureauId: string,
    name: string,
    basePrice: number,
    marginPercentage: number,
  ): Promise<Service | null> {
    const result = await Database.query(
      `INSERT INTO services (bureau_id, name, base_price, margin_percentage, active)
       VALUES ($1, $2, $3, $4, true)
       RETURNING id, bureau_id, name, base_price, margin_percentage, active, created_at`,
      [bureauId, name, basePrice, marginPercentage],
    );
    return result.rows[0] || null;
  }

  static async update(
    id: string,
    bureauId: string,
    data: Partial<{ name: string; base_price: number; margin_percentage: number; active: boolean }>,
  ): Promise<Service | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.name) {
      fields.push(`name = $${paramIndex++}`);
      values.push(data.name);
    }
    if (data.base_price !== undefined) {
      fields.push(`base_price = $${paramIndex++}`);
      values.push(data.base_price);
    }
    if (data.margin_percentage !== undefined) {
      fields.push(`margin_percentage = $${paramIndex++}`);
      values.push(data.margin_percentage);
    }
    if (data.active !== undefined) {
      fields.push(`active = $${paramIndex++}`);
      values.push(data.active);
    }

    if (fields.length === 0) {
      return this.findById(id, bureauId);
    }

    values.push(id, bureauId);

    const result = await Database.query(
      `UPDATE services SET ${fields.join(', ')}, updated_at = NOW()
       WHERE id = $${paramIndex} AND bureau_id = $${paramIndex + 1}
       RETURNING id, bureau_id, name, base_price, margin_percentage, active, created_at`,
      values,
    );

    return result.rows[0] || null;
  }
}
