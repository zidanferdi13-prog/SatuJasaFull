/**
 * Seed Super Admin
 * Run: npx ts-node src/migrations/seed-superadmin.ts
 * Or via docker: docker compose exec backend npx ts-node src/migrations/seed-superadmin.ts
 */
import bcrypt from 'bcryptjs';
import prisma from '../config/prisma';

const SERVICE_TYPES = [
  { name: 'Pajak Tahunan', description: 'Pembayaran pajak STNK tahunan' },
  { name: 'Pajak 5 Tahunan / Ganti Plat', description: 'Perpanjangan STNK 5 tahun dan ganti plat' },
  { name: 'BBN / Balik Nama', description: 'Proses balik nama kepemilikan kendaraan' },
  { name: 'Mutasi Keluar', description: 'Proses mutasi kendaraan keluar daerah' },
  { name: 'Mutasi Masuk', description: 'Proses mutasi kendaraan masuk daerah' },
  { name: 'Cabut Berkas', description: 'Cabut berkas kendaraan' },
  { name: 'STNK Hilang / Duplikat STNK', description: 'Pengurusan STNK hilang atau duplikat STNK' },
  { name: 'BPKB Hilang / Duplikat BPKB', description: 'Pengurusan BPKB hilang atau duplikat BPKB' },
  { name: 'Blokir STNK', description: 'Pemblokiran STNK atau lapor jual kendaraan' },
  { name: 'Cek Pajak Kendaraan', description: 'Cek pajak kendaraan' },
  { name: 'Pajak Mati / Telat Pajak', description: 'Pengurusan pajak mati atau telat pajak' },
  { name: 'Lainnya', description: 'Layanan STNK lainnya' },
];

const VEHICLE_TYPES = [
  { code: 'MOTOR', name: 'Motor', priceGroup: 'R2_R3' },
  { code: 'MOBIL', name: 'Mobil', priceGroup: 'R4_PLUS' },
  { code: 'PICKUP', name: 'Pick Up', priceGroup: 'R4_PLUS' },
  { code: 'TRUK', name: 'Truk', priceGroup: 'R4_PLUS' },
  { code: 'BUS', name: 'Bus', priceGroup: 'R4_PLUS' },
  { code: 'LAINNYA', name: 'Lainnya', priceGroup: 'KHUSUS' },
];

const FEE_COMPONENTS = [
  ['PKB_POKOK', 'PKB Pokok'],
  ['PKB_DENDA', 'PKB Denda'],
  ['OPSEN_PKB_POKOK', 'Opsen PKB Pokok'],
  ['OPSEN_PKB_DENDA', 'Opsen PKB Denda'],
  ['SWDKLLJ_POKOK', 'SWDKLLJ Pokok'],
  ['SWDKLLJ_DENDA', 'SWDKLLJ Denda'],
  ['PNBP_STNK', 'PNBP STNK'],
  ['PNBP_TNKB', 'PNBP TNKB'],
  ['PKB', 'Pajak Kendaraan Bermotor'],
  ['SWDKLLJ', 'SWDKLLJ'],
  ['DENDA_PKB', 'Denda PKB'],
  ['DENDA_SWDKLLJ', 'Denda SWDKLLJ'],
  ['STNK', 'Biaya STNK'],
  ['TNKB', 'Biaya TNKB / Plat'],
  ['BPKB', 'Biaya BPKB'],
  ['SURAT_MUTASI', 'Surat Mutasi'],
  ['BBNKB', 'Bea Balik Nama Kendaraan Bermotor'],
  ['JASA_BIRO', 'Jasa Biro'],
  ['CEK_FISIK', 'Cek Fisik'],
  ['SURAT_KEHILANGAN', 'Surat Kehilangan'],
  ['PENGUMUMAN_KEHILANGAN', 'Pengumuman Kehilangan'],
  ['BIAYA_TAMBAHAN', 'Biaya Tambahan'],
  ['LAINNYA', 'Lainnya'],
];

const SERVICE_FEE_COMPONENTS: Record<string, string[]> = {
  'Pajak Tahunan': ['PKB_POKOK', 'OPSEN_PKB_POKOK', 'SWDKLLJ_POKOK', 'JASA_BIRO'],
  'Pajak 5 Tahunan / Ganti Plat': ['PKB_POKOK', 'OPSEN_PKB_POKOK', 'SWDKLLJ_POKOK', 'PNBP_STNK', 'PNBP_TNKB', 'JASA_BIRO'],
  'BBN / Balik Nama': ['BBNKB', 'PKB_POKOK', 'OPSEN_PKB_POKOK', 'SWDKLLJ_POKOK', 'PNBP_STNK', 'BPKB', 'JASA_BIRO'],
  'Mutasi Keluar': ['SURAT_MUTASI', 'PKB_POKOK', 'SWDKLLJ_POKOK', 'JASA_BIRO'],
  'Mutasi Masuk': ['PKB_POKOK', 'SWDKLLJ_POKOK', 'PNBP_STNK', 'PNBP_TNKB', 'BPKB', 'BBNKB', 'JASA_BIRO'],
  'Cabut Berkas': ['SURAT_MUTASI', 'PKB_POKOK', 'SWDKLLJ_POKOK', 'JASA_BIRO'],
  'STNK Hilang / Duplikat STNK': ['PNBP_STNK', 'SURAT_KEHILANGAN', 'CEK_FISIK', 'JASA_BIRO'],
  'BPKB Hilang / Duplikat BPKB': ['BPKB', 'SURAT_KEHILANGAN', 'PENGUMUMAN_KEHILANGAN', 'CEK_FISIK', 'JASA_BIRO'],
  'Blokir STNK': ['JASA_BIRO'],
  'Cek Pajak Kendaraan': ['JASA_BIRO'],
  'Pajak Mati / Telat Pajak': ['PKB_POKOK', 'PKB_DENDA', 'OPSEN_PKB_POKOK', 'OPSEN_PKB_DENDA', 'SWDKLLJ_POKOK', 'SWDKLLJ_DENDA', 'JASA_BIRO'],
  'Lainnya': ['BIAYA_TAMBAHAN', 'JASA_BIRO'],
};

const DOCUMENT_REQUIREMENTS: Record<string, string[]> = {
  'Pajak Tahunan': ['STNK Asli', 'KTP Asli / Fotokopi KTP', 'Notice Pajak Lama'],
  'Pajak 5 Tahunan / Ganti Plat': ['STNK Asli', 'KTP Asli / Fotokopi KTP', 'BPKB Asli', 'Kendaraan untuk cek fisik', 'Hasil Cek Fisik'],
  'BBN / Balik Nama': ['STNK Asli', 'BPKB Asli', 'KTP Pemilik Baru', 'KTP Pemilik Lama', 'Kwitansi Jual Beli', 'Faktur Kendaraan', 'Hasil Cek Fisik'],
  'Mutasi Keluar': ['STNK Asli', 'BPKB Asli', 'KTP Pemilik', 'Hasil Cek Fisik', 'Surat Kuasa'],
  'Mutasi Masuk': ['Berkas Mutasi Keluar', 'BPKB Asli', 'KTP Pemilik', 'Hasil Cek Fisik'],
  'Cabut Berkas': ['STNK Asli', 'BPKB Asli', 'KTP Pemilik', 'Hasil Cek Fisik', 'Surat Kuasa'],
  'STNK Hilang / Duplikat STNK': ['KTP Pemilik', 'BPKB Asli', 'Surat Kehilangan Polisi', 'Cek Fisik'],
  'BPKB Hilang / Duplikat BPKB': ['STNK Asli', 'KTP Pemilik', 'Surat Kehilangan Polisi', 'Surat Pernyataan', 'Bukti Pengumuman Kehilangan', 'Cek Fisik'],
  'Blokir STNK': ['KTP Pemilik Lama', 'STNK / Data Kendaraan', 'Bukti Jual Beli', 'Surat Pernyataan Blokir'],
  'Cek Pajak Kendaraan': ['Nomor Polisi', 'Data Kendaraan'],
};

const BASE_AMOUNTS: Record<string, Record<string, number>> = {
  R2_R3: { PNBP_STNK: 100000, PNBP_TNKB: 60000, STNK: 100000, TNKB: 60000, BPKB: 225000, SURAT_MUTASI: 150000 },
  R4_PLUS: { PNBP_STNK: 200000, PNBP_TNKB: 100000, STNK: 200000, TNKB: 100000, BPKB: 375000, SURAT_MUTASI: 250000 },
  KHUSUS: { STNK: 0, TNKB: 0, BPKB: 0, SURAT_MUTASI: 0 },
};

const DEFAULT_SERVICE_AMOUNTS: Record<string, number> = {
  JASA_BIRO: 150000,
};

const ALL_SERVICE_COMPONENT_CODES = [...new Set(Object.values(SERVICE_FEE_COMPONENTS).flat())];
const STALE_COMPONENT_CODES = ['OPERASIONAL', 'DENDA_PKB', 'DENDA_SWDKLLJ'];

const slugCode = (value: string) => value.toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_|_$/g, '');

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
  } else {
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
  }

  const serviceTypes = new Map<string, string>();
  for (const st of SERVICE_TYPES) {
    const existingService = await prisma.serviceType.findFirst({ where: { name: st.name, tenantId: null } });
    const serviceType = existingService
      ? await prisma.serviceType.update({ where: { id: existingService.id }, data: { description: st.description, isActive: true } })
      : await prisma.serviceType.create({ data: { ...st, tenantId: null, isActive: true } });

    serviceTypes.set(st.name, serviceType.id);
    console.log(`✔ Service type ready: ${st.name}`);
  }

  for (const vehicleType of VEHICLE_TYPES) {
    await prisma.masterVehicleType.upsert({
      where: { code: vehicleType.code },
      update: { name: vehicleType.name, priceGroup: vehicleType.priceGroup, isActive: true },
      create: vehicleType,
    });
  }
  console.log('✔ Master vehicle types ready');

  for (const [code, name] of FEE_COMPONENTS) {
    await prisma.masterFeeComponent.upsert({
      where: { code },
      update: { name, isActive: true },
      create: { code, name },
    });
  }
  console.log('✔ Master fee components ready');

  const componentNameByCode = Object.fromEntries(FEE_COMPONENTS);
  for (const [serviceName, componentCodes] of Object.entries(SERVICE_FEE_COMPONENTS)) {
    const serviceTypeId = serviceTypes.get(serviceName);
    if (!serviceTypeId) continue;

    await prisma.masterFeeRule.updateMany({
      where: {
        tenantId: null,
        provinceCode: 'JABAR',
        serviceTypeId,
        componentCode: { in: [...ALL_SERVICE_COMPONENT_CODES, ...STALE_COMPONENT_CODES] },
      },
      data: { isActive: false },
    });

    for (const vehicleType of VEHICLE_TYPES) {
      for (const [index, componentCode] of componentCodes.entries()) {
        const existing = await prisma.masterFeeRule.findFirst({
          where: {
            tenantId: null,
            provinceCode: 'JABAR',
            serviceTypeId,
            vehicleTypeCode: vehicleType.code,
            componentCode,
          },
        });
        const defaultAmount = BASE_AMOUNTS[vehicleType.priceGroup]?.[componentCode] ?? DEFAULT_SERVICE_AMOUNTS[componentCode] ?? 0;
        const data = {
          tenantId: null,
          provinceCode: 'JABAR',
          serviceTypeId,
          vehicleTypeCode: vehicleType.code,
          priceGroup: vehicleType.priceGroup,
          componentCode,
          componentName: componentNameByCode[componentCode] || componentCode,
          defaultAmount,
          isEditable: true,
          isRequired: true,
          sortOrder: index + 1,
          isActive: true,
        };

        if (existing) await prisma.masterFeeRule.update({ where: { id: existing.id }, data });
        else await prisma.masterFeeRule.create({ data });
      }
    }
  }
  console.log('✔ JABAR master fee rules ready');

  for (const [serviceName, documents] of Object.entries(DOCUMENT_REQUIREMENTS)) {
    const serviceTypeId = serviceTypes.get(serviceName);
    if (!serviceTypeId) continue;

    for (const [index, documentName] of documents.entries()) {
      const documentCode = slugCode(documentName);
      const existing = await prisma.masterServiceDocumentRequirement.findFirst({
        where: { tenantId: null, serviceTypeId, documentCode },
      });
      const data = {
        tenantId: null,
        serviceTypeId,
        documentCode,
        documentName,
        isRequired: true,
        sortOrder: index + 1,
        isActive: true,
      };

      if (existing) await prisma.masterServiceDocumentRequirement.update({ where: { id: existing.id }, data });
      else await prisma.masterServiceDocumentRequirement.create({ data });
    }
  }
  console.log('✔ Service document requirements ready');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
