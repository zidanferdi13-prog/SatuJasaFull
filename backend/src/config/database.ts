import { Pool } from 'pg';

export class Database {
  private static pool: Pool;

  static async connect() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    await this.pool.query('SELECT NOW()');
  }

  static getPool() {
    return this.pool;
  }

  static async query(text: string, params?: any[]) {
    return this.pool.query(text, params);
  }

  static async disconnect() {
    await this.pool.end();
  }
}
