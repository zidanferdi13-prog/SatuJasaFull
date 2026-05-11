import { Database } from '../config/database';
import { User } from '../types';

export class UserModel {
  static async findByEmail(email: string): Promise<User | null> {
    const result = await Database.query(
      `SELECT id, bureau_id, email, full_name, phone, role, is_active, created_at, updated_at
       FROM users WHERE email = $1`,
      [email],
    );
    return result.rows[0] || null;
  }

  static async findById(id: string): Promise<User | null> {
    const result = await Database.query(
      `SELECT id, bureau_id, email, full_name, phone, role, is_active, created_at, updated_at
       FROM users WHERE id = $1`,
      [id],
    );
    return result.rows[0] || null;
  }

  static async create(
    email: string,
    passwordHash: string,
    fullName: string,
    phone: string | null,
    role: string,
    bureauId: string | null = null,
  ): Promise<User | null> {
    const result = await Database.query(
      `INSERT INTO users (email, password_hash, full_name, phone, role, bureau_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, bureau_id, email, full_name, phone, role, is_active, created_at, updated_at`,
      [email, passwordHash, fullName, phone, role, bureauId],
    );
    return result.rows[0] || null;
  }

  static async getPasswordHash(email: string): Promise<string | null> {
    const result = await Database.query(`SELECT password_hash FROM users WHERE email = $1`, [email]);
    return result.rows[0]?.password_hash || null;
  }

  static async findByBureau(bureauId: string): Promise<User[]> {
    const result = await Database.query(
      `SELECT id, bureau_id, email, full_name, phone, role, is_active, created_at, updated_at
       FROM users WHERE bureau_id = $1 ORDER BY created_at DESC`,
      [bureauId],
    );
    return result.rows;
  }

  static async updateBureauId(userId: string, bureauId: string): Promise<boolean> {
    const result = await Database.query(
      `UPDATE users SET bureau_id = $1, updated_at = NOW() WHERE id = $2`,
      [bureauId, userId],
    );
    return result.rowCount > 0;
  }
}
