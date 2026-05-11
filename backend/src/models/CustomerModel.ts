import { Database } from '../config/database';
import { Customer } from '../types';

export class CustomerModel {
  static async create(
    bureauId: string,
    name: string,
    phone: string,
    email?: string,
    vehicleNumber?: string,
    vehicleType?: string,
  ): Promise<Customer | null> {
    const result = await Database.query(
      `INSERT INTO customers (bureau_id, name, phone, email, vehicle_number, vehicle_type)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, bureau_id, name, phone, email, vehicle_number, created_at`,
      [bureauId, name, phone, email || null, vehicleNumber || null, vehicleType || null],
    );
    return result.rows[0] || null;
  }

  static async findByPhone(bureauId: string, phone: string): Promise<Customer | null> {
    const result = await Database.query(
      `SELECT id, bureau_id, name, phone, email, vehicle_number, created_at
       FROM customers WHERE bureau_id = $1 AND phone = $2`,
      [bureauId, phone],
    );
    return result.rows[0] || null;
  }

  static async findById(id: string, bureauId: string): Promise<Customer | null> {
    const result = await Database.query(
      `SELECT id, bureau_id, name, phone, email, vehicle_number, created_at
       FROM customers WHERE id = $1 AND bureau_id = $2`,
      [id, bureauId],
    );
    return result.rows[0] || null;
  }

  static async update(
    id: string,
    bureauId: string,
    data: Partial<{ name: string; email: string; vehicle_number: string }>,
  ): Promise<Customer | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.name) {
      fields.push(`name = $${paramIndex++}`);
      values.push(data.name);
    }
    if (data.email) {
      fields.push(`email = $${paramIndex++}`);
      values.push(data.email);
    }
    if (data.vehicle_number) {
      fields.push(`vehicle_number = $${paramIndex++}`);
      values.push(data.vehicle_number);
    }

    if (fields.length === 0) {
      return this.findById(id, bureauId);
    }

    values.push(id, bureauId);

    const result = await Database.query(
      `UPDATE customers SET ${fields.join(', ')}, updated_at = NOW()
       WHERE id = $${paramIndex} AND bureau_id = $${paramIndex + 1}
       RETURNING id, bureau_id, name, phone, email, vehicle_number, created_at`,
      values,
    );

    return result.rows[0] || null;
  }

  static async list(bureauId: string, limit: number = 50, offset: number = 0): Promise<Customer[]> {
    const result = await Database.query(
      `SELECT id, bureau_id, name, phone, email, vehicle_number, created_at
       FROM customers WHERE bureau_id = $1
       ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [bureauId, limit, offset],
    );
    return result.rows;
  }
}
