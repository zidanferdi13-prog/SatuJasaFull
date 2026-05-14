/**
 * Seed Super Admin
 * Run: npx ts-node src/migrations/seed-superadmin.ts
 * Or via docker: docker compose exec backend npx ts-node src/migrations/seed-superadmin.ts
 */
import bcrypt from 'bcryptjs';
import prisma from '../config/prisma';

async function main() {
  // Super admin lives under a special system tenant
  let systemTenant = await prisma.tenant.findUnique({ where: { code: 'SYSTEM' } });

  if (!systemTenant) {
    systemTenant = await prisma.tenant.create({
      data: {
        code: 'SYSTEM',
        name: 'System',
        subscriptionStart: new Date(),
        subscriptionEnd: new Date('2099-12-31'),
        subscriptionStatus: 'ACTIVE',
      },
    });
    console.log('✔ System tenant created');
  }

  const existing = await prisma.user.findUnique({ where: { email: 'admin@stnkbureau.com' } });
  if (existing) {
    console.log('⚠ Super admin already exists:', existing.email);
    return;
  }

  const passwordHash = await bcrypt.hash('Admin@1234', 12);

  const admin = await prisma.user.create({
    data: {
      name: 'Super Admin',
      email: 'admin@stnkbureau.com',
      passwordHash,
      role: 'SUPER_ADMIN',
      isActive: true,
      tenantId: systemTenant.id,
    },
  });

  console.log('✔ Super admin created:');
  console.log('  Email   :', admin.email);
  console.log('  Password: Admin@1234');
  console.log('  Role    :', admin.role);

  // Seed default global service types
  const defaultServiceTypes = [
    { name: 'STNK Baru', description: 'Pengurusan STNK baru kendaraan' },
    { name: 'Perpanjangan STNK 1 Tahun', description: 'Perpanjangan STNK tahunan' },
    { name: 'Perpanjangan STNK 5 Tahun (Ganti Plat)', description: 'Perpanjangan STNK 5 tahun + penggantian plat nomor' },
    { name: 'Balik Nama Kendaraan', description: 'Proses balik nama kepemilikan kendaraan' },
    { name: 'Mutasi Kendaraan', description: 'Proses mutasi kendaraan antar daerah' },
    { name: 'Blokir / Lapor Jual', description: 'Pemblokiran STNK atau lapor jual kendaraan' },
  ];

  for (const st of defaultServiceTypes) {
    const exists = await prisma.serviceType.findFirst({ where: { name: st.name, tenantId: null } });
    if (!exists) {
      await prisma.serviceType.create({ data: { ...st, tenantId: null, isActive: true } });
      console.log(`✔ Service type created: ${st.name}`);
    }
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
