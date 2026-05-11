import { readdir, readFile } from 'fs/promises';
import path from 'path';
import { Database } from './database';

interface Migration {
  name: string;
  path: string;
}

class MigrationRunner {
  private migrationsDir = path.join(__dirname, '../migrations');

  async run() {
    try {
      console.log('🔄 Running migrations...');

      const migrations = await this.getMigrations();

      if (migrations.length === 0) {
        console.log('✓ No migrations to run');
        return;
      }

      for (const migration of migrations) {
        await this.runMigration(migration);
      }

      console.log('✓ All migrations completed successfully');
    } catch (error) {
      console.error('✗ Migration failed:', error);
      throw error;
    } finally {
      await Database.disconnect();
    }
  }

  private async getMigrations(): Promise<Migration[]> {
    const files = await readdir(this.migrationsDir);
    return files
      .filter((f) => f.endsWith('.sql'))
      .sort()
      .map((f) => ({
        name: f,
        path: path.join(this.migrationsDir, f),
      }));
  }

  private async runMigration(migration: Migration) {
    console.log(`⏳ Running: ${migration.name}`);

    const sql = await readFile(migration.path, 'utf-8');

    try {
      await Database.query(sql);
      console.log(`✓ Completed: ${migration.name}`);
    } catch (error: any) {
      console.error(`✗ Failed: ${migration.name}`);
      console.error(error.message);
      throw error;
    }
  }
}

const runner = new MigrationRunner();
runner.run();
