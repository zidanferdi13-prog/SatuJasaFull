import { Database } from './config/database';
import bcrypt from 'bcryptjs';

interface SeedData {
  admin: { email: string; password: string };
  bureaus: Array<{ name: string; phone: string }>;
}

const SEED_DATA: SeedData = {
  admin: {
    email: 'admin@stnkbureau.local',
    password: 'admin123456',
  },
  bureaus: [
    { name: 'Biro Jasa STNK Jakarta Pusat', phone: '021-1234567' },
    { name: 'Biro Jasa STNK Bandung', phone: '022-9876543' },
    { name: 'Biro Jasa STNK Surabaya', phone: '031-5555555' },
  ],
};

class Seeder {
  async run() {
    try {
      console.log('🌱 Starting seed...');

      // Create admin user
      await this.seedAdmin();

      // Create subscription plans
      await this.seedSubscriptionPlans();

      // Create bureaus with owner
      await this.seedBureaus();

      console.log('✓ Seed completed successfully');
    } catch (error) {
      console.error('✗ Seed failed:', error);
      throw error;
    } finally {
      await Database.disconnect();
    }
  }

  private async seedAdmin() {
    console.log('⏳ Creating admin user...');

    const passwordHash = await bcrypt.hash(SEED_DATA.admin.password, 10);

    const result = await Database.query(
      `
      INSERT INTO users (email, password_hash, full_name, role)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO NOTHING
      RETURNING id
      `,
      [SEED_DATA.admin.email, passwordHash, 'System Admin', 'ADMIN'],
    );

    if (result.rows.length > 0) {
      console.log(`✓ Admin user created: ${SEED_DATA.admin.email}`);
      console.log(`  Password: ${SEED_DATA.admin.password}`);
    } else {
      console.log(`✓ Admin user already exists: ${SEED_DATA.admin.email}`);
    }
  }

  private async seedSubscriptionPlans() {
    console.log('⏳ Creating subscription plans...');

    const plans = [
      {
        name: 'BASIC',
        priceMonthly: 99000,
        maxStaff: 2,
        maxTransactions: null,
        features: JSON.stringify(['Transactions', 'Basic Tracking']),
      },
      {
        name: 'PRO',
        priceMonthly: 299000,
        maxStaff: 10,
        maxTransactions: null,
        features: JSON.stringify(['Transactions', 'Advanced Tracking', 'Analytics']),
      },
      {
        name: 'ENTERPRISE',
        priceMonthly: 999000,
        maxStaff: null,
        maxTransactions: null,
        features: JSON.stringify(['Transactions', 'Advanced Tracking', 'Analytics', 'Custom Support']),
      },
    ];

    for (const plan of plans) {
      await Database.query(
        `
        INSERT INTO subscription_plans (name, price_monthly, max_staff, max_transactions, features)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (name) DO NOTHING
        `,
        [plan.name, plan.priceMonthly, plan.maxStaff, plan.maxTransactions, plan.features],
      );
    }

    console.log('✓ Subscription plans created');
  }

  private async seedBureaus() {
    console.log('⏳ Creating bureaus...');

    // Get BASIC plan ID
    const planResult = await Database.query(`SELECT id FROM subscription_plans WHERE name = 'BASIC'`);
    const basicPlanId = planResult.rows[0]?.id;

    if (!basicPlanId) {
      throw new Error('BASIC plan not found');
    }

    for (const bureau of SEED_DATA.bureaus) {
      // Create owner user
      const ownerEmail = `owner-${bureau.name.toLowerCase().replace(/\s+/g, '-')}@stnkbureau.local`;
      const ownerPassword = 'password123456';
      const passwordHash = await bcrypt.hash(ownerPassword, 10);

      const userResult = await Database.query(
        `
        INSERT INTO users (email, password_hash, full_name, role)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (email) DO NOTHING
        RETURNING id
        `,
        [ownerEmail, passwordHash, `${bureau.name} Owner`, 'OWNER'],
      );

      const ownerId = userResult.rows[0]?.id;

      if (ownerId) {
        // Create bureau
        const bureauResult = await Database.query(
          `
          INSERT INTO bureaus (name, owner_id, phone, status, subscription_plan, subscription_expires_at)
          VALUES ($1, $2, $3, $4, $5, NOW() + INTERVAL '30 days')
          RETURNING id
          `,
          [bureau.name, ownerId, bureau.phone, 'ACTIVE', 'BASIC'],
        );

        const bureauId = bureauResult.rows[0]?.id;

        // Update user with bureau_id
        await Database.query(`UPDATE users SET bureau_id = $1 WHERE id = $2`, [bureauId, ownerId]);

        // Create bureau subscription record
        await Database.query(
          `
          INSERT INTO bureau_subscriptions (bureau_id, plan_id, started_at, expires_at, auto_renew)
          VALUES ($1, $2, NOW(), NOW() + INTERVAL '30 days', true)
          `,
          [bureauId, basicPlanId],
        );

        // Create sample services for the bureau
        await this.seedServices(bureauId);

        console.log(`✓ Bureau created: ${bureau.name}`);
        console.log(`  Owner: ${ownerEmail} / ${ownerPassword}`);
      }
    }
  }

  private async seedServices(bureauId: string) {
    const services = [
      { name: 'Perpanjangan STNK', basePrice: 500000, margin: 15 },
      { name: 'Balik Nama', basePrice: 750000, margin: 20 },
      { name: 'Pergantian Kepemilikan', basePrice: 600000, margin: 18 },
    ];

    for (const service of services) {
      await Database.query(
        `
        INSERT INTO services (bureau_id, name, base_price, margin_percentage, active)
        VALUES ($1, $2, $3, $4, true)
        ON CONFLICT (bureau_id, name) DO NOTHING
        `,
        [bureauId, service.name, service.basePrice, service.margin],
      );
    }
  }
}

const seeder = new Seeder();
seeder.run();
