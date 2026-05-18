# FEE_DESIGN.md

# STNK Service Fee Design

Dokumen ini adalah rangkuman final dari keputusan desain fitur biaya layanan Biro Jasa STNK untuk aplikasi.

Fokus utama:
- Jenis jasa / layanan STNK
- Tipe kendaraan
- Base perhitungan awal wilayah Jawa Barat
- Master harga otomatis dari database
- Biaya transaksi bisa diedit oleh pemakai aplikasi/admin
- Dokumen tidak upload foto dulu, cukup checklist
- Biaya jasa biro dan operasional berasal dari database, tapi tetap editable

---

## 1. Prinsip Utama

Sistem tidak menghitung biaya secara hardcode di frontend.

Semua biaya default harus berasal dari master database.

Saat order dibuat, sistem akan:

```text
User/Admin pilih jenis jasa
User/Admin pilih tipe kendaraan
User/Admin pilih wilayah / kota Samsat
Sistem ambil master harga dari database
Sistem copy biaya default ke detail transaksi
Pemakai aplikasi/admin bisa edit nominal biaya
Total dihitung dari detail biaya transaksi
```

Konsep penting:

```text
default_amount = nilai awal dari master harga
amount         = nilai aktual yang dipakai di transaksi
```

Jika ada perubahan di master harga, transaksi lama tidak boleh berubah.

---

## 2. Base Wilayah

Untuk tahap awal, sistem menggunakan base wilayah:

```text
province_code = JABAR
province_name = Jawa Barat
```

Aturan Jawa Barat dipakai sebagai default awal, tetapi tetap fleksibel karena semua biaya di transaksi bisa diedit.

---

## 3. Jenis Jasa / Layanan

Master jenis jasa yang digunakan:

| Kode | Nama Layanan |
|---|---|
| PAJAK_TAHUNAN | Pajak Tahunan |
| PAJAK_5_TAHUNAN | Pajak 5 Tahunan / Ganti Plat |
| BBN | BBN / Balik Nama |
| MUTASI_KELUAR | Mutasi Keluar |
| MUTASI_MASUK | Mutasi Masuk |
| CABUT_BERKAS | Cabut Berkas |
| STNK_HILANG | STNK Hilang / Duplikat STNK |
| BPKB_HILANG | BPKB Hilang / Duplikat BPKB |
| BLOKIR_STNK | Blokir STNK |
| BUKA_BLOKIR | Buka Blokir |
| CEK_PAJAK | Cek Pajak Kendaraan |
| PAJAK_MATI | Pajak Mati / Telat Pajak |
| RUBAH_WARNA | Rubah Warna Kendaraan |
| RUBAH_BENTUK | Rubah Bentuk Kendaraan |
| GANTI_ALAMAT | Ganti Alamat STNK |
| PLAT_HILANG | Plat Hilang / Rusak |
| CEK_FISIK | Bantuan Cek Fisik |
| LAINNYA | Lainnya |

Untuk MVP, layanan yang paling penting diaktifkan lebih dulu:

```text
PAJAK_TAHUNAN
PAJAK_5_TAHUNAN
BBN
MUTASI_KELUAR
MUTASI_MASUK
CABUT_BERKAS
STNK_HILANG
BPKB_HILANG
BLOKIR_STNK
CEK_PAJAK
PAJAK_MATI
LAINNYA
```

---

## 4. Tipe Kendaraan

Master tipe kendaraan:

| Kode | Nama Kendaraan | Price Group |
|---|---|---|
| MOTOR | Motor | R2_R3 |
| MOTOR_LISTRIK | Motor Listrik | R2_R3 |
| MOBIL | Mobil | R4_PLUS |
| MOBIL_LISTRIK | Mobil Listrik | R4_PLUS |
| PICKUP | Pick Up | R4_PLUS |
| BLIND_VAN | Blind Van | R4_PLUS |
| TRUK | Truk | R4_PLUS |
| DUMP_TRUCK | Dump Truck | R4_PLUS |
| BUS | Bus | R4_PLUS |
| TRONTON | Tronton | R4_PLUS |
| TRAILER | Trailer | R4_PLUS |
| AMBULANCE | Ambulance | R4_PLUS |
| ALAT_BERAT | Alat Berat | KHUSUS |
| KENDARAAN_KHUSUS | Kendaraan Khusus | KHUSUS |
| LAINNYA | Lainnya | KHUSUS |

Untuk MVP, tipe kendaraan minimal:

```text
MOTOR
MOBIL
PICKUP
TRUK
BUS
LAINNYA
```

---

## 5. Price Group

Untuk kebutuhan biaya resmi, kendaraan dikelompokkan menjadi:

| Price Group | Keterangan |
|---|---|
| R2_R3 | Kendaraan roda 2 / roda 3 |
| R4_PLUS | Kendaraan roda 4 atau lebih |
| KHUSUS | Kendaraan khusus / kondisi khusus |

Contoh mapping:

```text
MOTOR  -> R2_R3
MOBIL  -> R4_PLUS
PICKUP -> R4_PLUS
TRUK   -> R4_PLUS
BUS    -> R4_PLUS
```

---

## 6. Komponen Biaya

Master komponen biaya:

| Kode | Nama Komponen |
|---|---|
| PKB | Pajak Kendaraan Bermotor |
| SWDKLLJ | SWDKLLJ |
| DENDA_PKB | Denda PKB |
| DENDA_SWDKLLJ | Denda SWDKLLJ |
| STNK | Biaya STNK |
| TNKB | Biaya TNKB / Plat |
| BPKB | Biaya BPKB |
| SURAT_MUTASI | Surat Mutasi |
| BBNKB | Bea Balik Nama Kendaraan Bermotor |
| JASA_BIRO | Jasa Biro |
| OPERASIONAL | Operasional |
| CEK_FISIK | Cek Fisik |
| SURAT_KEHILANGAN | Surat Kehilangan |
| PENGUMUMAN_KEHILANGAN | Pengumuman Kehilangan |
| BIAYA_TAMBAHAN | Biaya Tambahan |
| LAINNYA | Lainnya |

---

## 7. Tarif Dasar Default Jawa Barat

Tarif dasar default yang ditempel dari master:

| Komponen | R2/R3 | R4+ |
|---|---:|---:|
| STNK | 100000 | 200000 |
| TNKB / Plat | 60000 | 100000 |
| BPKB | 225000 | 375000 |
| Surat Mutasi | 150000 | 250000 |

Catatan:
- Nilai ini adalah default awal dari master.
- Semua nilai tetap boleh diedit di transaksi.
- Jika aturan berubah, update master untuk transaksi baru saja.
- Transaksi lama tidak boleh ikut berubah.

---

## 8. BBNKB Jawa Barat

Untuk base awal Jawa Barat, BBNKB kendaraan bekas / BBNKB II dibuat default:

```text
BBNKB = 0
```

Namun komponen `BBNKB` tetap harus dibuat di transaksi agar bisa diedit jika:
- Ada perubahan aturan
- Ada kondisi khusus
- Ada koreksi manual dari admin

---

## 9. PKB dan Denda

PKB tidak boleh di-hardcode.

Default:

```text
PKB = 0
DENDA_PKB = 0
DENDA_SWDKLLJ = 0
```

Semua field tersebut harus editable karena nilainya bergantung pada:
- Kendaraan
- Tahun kendaraan
- NJKB
- Bobot kendaraan
- Pajak progresif
- Tunggakan
- Data Samsat
- Kondisi khusus

---

## 10. Jasa Biro dan Operasional

Biaya jasa biro dan operasional berasal dari database yang sudah disiapkan.

Namun setelah masuk transaksi, nominal tetap bisa diedit.

Konsep:

```text
JASA_BIRO default dari master DB
OPERASIONAL default dari master DB

Keduanya dicopy ke order_fee_details
Keduanya bisa diedit oleh user/admin
```

Alasan editable:
- Bisa ada perubahan biaya lapangan
- Bisa ada promo
- Bisa ada perbedaan wilayah
- Bisa ada tambahan jarak / pengambilan dokumen
- Bisa ada koreksi manual

---

## 11. Komponen Biaya per Jenis Jasa

### 11.1 Pajak Tahunan

Komponen:

```text
PKB
SWDKLLJ
DENDA_PKB
DENDA_SWDKLLJ
JASA_BIRO
OPERASIONAL
```

Rumus:

```text
Total = PKB + SWDKLLJ + DENDA_PKB + DENDA_SWDKLLJ + JASA_BIRO + OPERASIONAL
```

---

### 11.2 Pajak 5 Tahunan / Ganti Plat

Komponen:

```text
PKB
SWDKLLJ
DENDA_PKB
DENDA_SWDKLLJ
STNK
TNKB
JASA_BIRO
OPERASIONAL
```

Rumus:

```text
Total = PKB + SWDKLLJ + DENDA_PKB + DENDA_SWDKLLJ + STNK + TNKB + JASA_BIRO + OPERASIONAL
```

Default tarif:
- Motor: STNK 100000, TNKB 60000
- Mobil/R4+: STNK 200000, TNKB 100000

---

### 11.3 BBN / Balik Nama

Komponen:

```text
BBNKB
PKB
SWDKLLJ
DENDA_PKB
DENDA_SWDKLLJ
STNK
BPKB
JASA_BIRO
OPERASIONAL
```

Jika sekalian ganti plat, tambahkan:

```text
TNKB
```

Rumus:

```text
Total = BBNKB + PKB + SWDKLLJ + DENDA_PKB + DENDA_SWDKLLJ + STNK + BPKB + JASA_BIRO + OPERASIONAL
```

Default Jawa Barat kendaraan bekas:

```text
BBNKB = 0
```

Default tarif:
- Motor: STNK 100000, BPKB 225000
- Mobil/R4+: STNK 200000, BPKB 375000

---

### 11.4 Mutasi Keluar

Komponen:

```text
SURAT_MUTASI
PKB
SWDKLLJ
DENDA_PKB
DENDA_SWDKLLJ
JASA_BIRO
OPERASIONAL
```

Rumus:

```text
Total = SURAT_MUTASI + PKB + SWDKLLJ + DENDA_PKB + DENDA_SWDKLLJ + JASA_BIRO + OPERASIONAL
```

Catatan:
- PKB dan denda digunakan jika ada tunggakan.
- Jika tidak ada tunggakan, PKB dan denda bisa 0.

Default tarif surat mutasi:
- Motor: 150000
- Mobil/R4+: 250000

---

### 11.5 Mutasi Masuk

Komponen:

```text
PKB
SWDKLLJ
STNK
TNKB
BPKB
BBNKB
JASA_BIRO
OPERASIONAL
```

Rumus:

```text
Total = PKB + SWDKLLJ + STNK + TNKB + BPKB + BBNKB + JASA_BIRO + OPERASIONAL
```

Default Jawa Barat:
- BBNKB kendaraan bekas = 0
- STNK/TNKB/BPKB sesuai price group

---

### 11.6 Cabut Berkas

Komponen:

```text
SURAT_MUTASI
PKB
SWDKLLJ
DENDA_PKB
DENDA_SWDKLLJ
JASA_BIRO
OPERASIONAL
```

Rumus:

```text
Total = SURAT_MUTASI + PKB + SWDKLLJ + DENDA_PKB + DENDA_SWDKLLJ + JASA_BIRO + OPERASIONAL
```

Catatan:
- Secara biaya, cabut berkas mirip dengan mutasi keluar.

---

### 11.7 STNK Hilang / Duplikat STNK

Komponen:

```text
STNK
SURAT_KEHILANGAN
CEK_FISIK
JASA_BIRO
OPERASIONAL
```

Rumus:

```text
Total = STNK + SURAT_KEHILANGAN + CEK_FISIK + JASA_BIRO + OPERASIONAL
```

Default tarif STNK:
- Motor: 100000
- Mobil/R4+: 200000

---

### 11.8 BPKB Hilang / Duplikat BPKB

Komponen:

```text
BPKB
SURAT_KEHILANGAN
PENGUMUMAN_KEHILANGAN
CEK_FISIK
JASA_BIRO
OPERASIONAL
```

Rumus:

```text
Total = BPKB + SURAT_KEHILANGAN + PENGUMUMAN_KEHILANGAN + CEK_FISIK + JASA_BIRO + OPERASIONAL
```

Default tarif BPKB:
- Motor: 225000
- Mobil/R4+: 375000

---

### 11.9 Blokir STNK

Komponen:

```text
JASA_BIRO
OPERASIONAL
```

Rumus:

```text
Total = JASA_BIRO + OPERASIONAL
```

---

### 11.10 Buka Blokir

Komponen:

```text
PKB
SWDKLLJ
DENDA_PKB
DENDA_SWDKLLJ
JASA_BIRO
OPERASIONAL
```

Rumus:

```text
Total = PKB + SWDKLLJ + DENDA_PKB + DENDA_SWDKLLJ + JASA_BIRO + OPERASIONAL
```

---

### 11.11 Cek Pajak

Komponen:

```text
JASA_BIRO
```

Atau bisa gunakan komponen khusus:

```text
JASA_CEK_PAJAK
```

Rumus:

```text
Total = JASA_BIRO
```

Catatan:
- Layanan cek pajak bisa dibuat gratis sebagai strategi akuisisi user.
- Jika gratis, set default amount = 0.

---

### 11.12 Pajak Mati / Telat Pajak

Pajak mati adalah variasi dari pajak tahunan atau pajak 5 tahunan.

Komponen dasar:

```text
PKB
SWDKLLJ
DENDA_PKB
DENDA_SWDKLLJ
JASA_BIRO
OPERASIONAL
```

Jika sekalian 5 tahunan, tambahkan:

```text
STNK
TNKB
```

Rumus tahunan:

```text
Total = PKB + SWDKLLJ + DENDA_PKB + DENDA_SWDKLLJ + JASA_BIRO + OPERASIONAL
```

Rumus 5 tahunan:

```text
Total = PKB + SWDKLLJ + DENDA_PKB + DENDA_SWDKLLJ + STNK + TNKB + JASA_BIRO + OPERASIONAL
```

---

## 12. Input User Aplikasi

User aplikasi tidak perlu mengisi semua detail biaya.

Input utama user:

```text
Jenis Layanan
Tipe Kendaraan
Provinsi
Kota/Kabupaten Samsat
Nomor Polisi
Nama Pemilik
Tanggal Jatuh Tempo Pajak
Nama Pemohon
No WhatsApp
Alamat Pengambilan Dokumen
Alamat Pengantaran Dokumen
Catatan
```

Data kendaraan opsional:

```text
Merk Kendaraan
Model Kendaraan
Tahun Kendaraan
Nomor Rangka
Nomor Mesin
Warna Kendaraan
```

Biaya akan otomatis ditempel dari master database, lalu bisa diedit oleh pemakai aplikasi/admin.

---

## 13. Dokumen Tidak Upload File Dulu

Untuk MVP, dokumen/foto tidak diupload.

Alasannya:
- Database tidak cepat penuh
- Storage tidak membengkak
- Flow aplikasi lebih ringan
- Admin tetap bisa tracking kelengkapan dokumen

Solusi:

```text
Gunakan checklist dokumen
```

Admin cukup centang dokumen yang sudah diterima.

---

## 14. Checklist Dokumen per Jenis Jasa

### 14.1 Pajak Tahunan

```text
STNK Asli
KTP Asli / Fotokopi KTP
Notice Pajak Lama
```

---

### 14.2 Pajak 5 Tahunan / Ganti Plat

```text
STNK Asli
KTP Asli / Fotokopi KTP
BPKB Asli
Kendaraan untuk cek fisik
Hasil Cek Fisik
```

---

### 14.3 BBN / Balik Nama

```text
STNK Asli
BPKB Asli
KTP Pemilik Baru
KTP Pemilik Lama
Kwitansi Jual Beli
Faktur Kendaraan
Hasil Cek Fisik
```

---

### 14.4 Mutasi Keluar / Cabut Berkas

```text
STNK Asli
BPKB Asli
KTP Pemilik
Hasil Cek Fisik
Surat Kuasa
```

---

### 14.5 Mutasi Masuk

```text
Berkas Mutasi Keluar
BPKB Asli
KTP Pemilik
Hasil Cek Fisik
```

---

### 14.6 STNK Hilang

```text
KTP Pemilik
BPKB Asli
Surat Kehilangan Polisi
Cek Fisik
```

---

### 14.7 BPKB Hilang

```text
STNK Asli
KTP Pemilik
Surat Kehilangan Polisi
Surat Pernyataan
Bukti Pengumuman Kehilangan
Cek Fisik
```

---

### 14.8 Blokir STNK

```text
KTP Pemilik Lama
STNK / Data Kendaraan
Bukti Jual Beli
Surat Pernyataan Blokir
```

---

### 14.9 Cek Pajak

```text
Nomor Polisi
Data Kendaraan
```

---

## 15. Flow Order

Flow final pembuatan order:

```text
1. User/admin memilih jenis layanan
2. User/admin memilih tipe kendaraan
3. User/admin memilih provinsi dan kota Samsat
4. Sistem membuat order
5. Sistem mengambil master biaya dari m_fee_rules
6. Sistem copy biaya ke order_fee_details
7. Sistem mengambil checklist dokumen dari m_service_document_requirement
8. Sistem copy checklist ke order_document_checklist
9. User/admin bisa edit biaya di order_fee_details
10. Sistem menghitung total dari SUM(order_fee_details.amount)
11. Admin update status order
```

---

## 16. Database Design

### 16.1 m_service_type

Master jenis jasa.

```sql
CREATE TABLE m_service_type (
    id CHAR(36) PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT NULL,
    is_active TINYINT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

### 16.2 m_vehicle_type

Master tipe kendaraan.

```sql
CREATE TABLE m_vehicle_type (
    id CHAR(36) PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    price_group VARCHAR(50) NOT NULL,
    is_active TINYINT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

### 16.3 m_fee_component

Master komponen biaya.

```sql
CREATE TABLE m_fee_component (
    id CHAR(36) PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT NULL,
    is_active TINYINT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

### 16.4 m_fee_rules

Master harga default per jasa, kendaraan, dan wilayah.

```sql
CREATE TABLE m_fee_rules (
    id CHAR(36) PRIMARY KEY,
    province_code VARCHAR(20) NOT NULL,
    service_code VARCHAR(50) NOT NULL,
    vehicle_type_code VARCHAR(50) NOT NULL,
    component_code VARCHAR(50) NOT NULL,
    component_name VARCHAR(100) NOT NULL,
    default_amount DECIMAL(15,2) DEFAULT 0,
    is_editable TINYINT DEFAULT 1,
    is_required TINYINT DEFAULT 1,
    sort_order INT DEFAULT 0,
    is_active TINYINT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

Catatan:
- `default_amount` adalah nilai default dari master.
- Semua biaya boleh diedit di transaksi.
- Jika ingin semua bisa diedit, set `is_editable = 1`.

---

### 16.5 orders

Tabel order utama.

```sql
CREATE TABLE orders (
    id CHAR(36) PRIMARY KEY,
    order_number VARCHAR(50) NULL,
    service_code VARCHAR(50) NOT NULL,
    vehicle_type_code VARCHAR(50) NOT NULL,
    province_code VARCHAR(20) DEFAULT 'JABAR',
    city_code VARCHAR(50) NULL,
    city_name VARCHAR(100) NULL,
    police_number VARCHAR(30) NULL,
    owner_name VARCHAR(100) NULL,
    tax_due_date DATE NULL,
    applicant_name VARCHAR(100) NULL,
    applicant_phone VARCHAR(30) NULL,
    pickup_address TEXT NULL,
    delivery_address TEXT NULL,
    notes TEXT NULL,
    status VARCHAR(50) DEFAULT 'ORDER_DIBUAT',
    total_amount DECIMAL(15,2) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

### 16.6 order_fee_details

Detail biaya transaksi.

```sql
CREATE TABLE order_fee_details (
    id CHAR(36) PRIMARY KEY,
    order_id CHAR(36) NOT NULL,
    component_code VARCHAR(50) NOT NULL,
    component_name VARCHAR(100) NOT NULL,
    default_amount DECIMAL(15,2) DEFAULT 0,
    amount DECIMAL(15,2) DEFAULT 0,
    is_editable TINYINT DEFAULT 1,
    source VARCHAR(30) DEFAULT 'master',
    notes TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

Total order dihitung dari:

```sql
SELECT COALESCE(SUM(amount), 0) AS total
FROM order_fee_details
WHERE order_id = ?;
```

---

### 16.7 m_service_document_requirement

Master checklist dokumen per layanan.

```sql
CREATE TABLE m_service_document_requirement (
    id CHAR(36) PRIMARY KEY,
    service_code VARCHAR(50) NOT NULL,
    document_code VARCHAR(50) NOT NULL,
    document_name VARCHAR(100) NOT NULL,
    is_required TINYINT DEFAULT 1,
    sort_order INT DEFAULT 0,
    is_active TINYINT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

### 16.8 order_document_checklist

Checklist dokumen per order.

```sql
CREATE TABLE order_document_checklist (
    id CHAR(36) PRIMARY KEY,
    order_id CHAR(36) NOT NULL,
    document_code VARCHAR(50) NOT NULL,
    document_name VARCHAR(100) NOT NULL,
    is_required TINYINT DEFAULT 1,
    is_checked TINYINT DEFAULT 0,
    checked_at DATETIME NULL,
    checked_by VARCHAR(100) NULL,
    notes TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

### 16.9 order_status_logs

Opsional untuk tracking status.

```sql
CREATE TABLE order_status_logs (
    id CHAR(36) PRIMARY KEY,
    order_id CHAR(36) NOT NULL,
    status VARCHAR(50) NOT NULL,
    notes TEXT NULL,
    created_by VARCHAR(100) NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 17. Status Order

Status awal:

| Status | Keterangan |
|---|---|
| ORDER_DIBUAT | Order baru dibuat |
| MENUNGGU_DOKUMEN | Menunggu dokumen dari customer |
| DOKUMEN_DITERIMA | Dokumen sudah diterima |
| BIAYA_DIVERIFIKASI | Biaya sudah dicek admin |
| MENUNGGU_PEMBAYARAN | Menunggu pembayaran |
| DIPROSES | Sedang diproses |
| SELESAI | Order selesai |
| DIBATALKAN | Order dibatalkan |

---

## 18. Logic Generate Biaya Order

Saat order dibuat, ambil data dari `m_fee_rules`, lalu copy ke `order_fee_details`.

```js
async function generateOrderFees(orderId, serviceCode, vehicleTypeCode, provinceCode) {
  const feeRules = await db.query(`
    SELECT 
      component_code,
      component_name,
      default_amount,
      is_editable,
      sort_order
    FROM m_fee_rules
    WHERE service_code = ?
      AND vehicle_type_code = ?
      AND province_code = ?
      AND is_active = 1
    ORDER BY sort_order ASC
  `, [serviceCode, vehicleTypeCode, provinceCode]);

  const inserts = feeRules.map((fee) => [
    crypto.randomUUID(),
    orderId,
    fee.component_code,
    fee.component_name,
    fee.default_amount,
    fee.default_amount,
    fee.is_editable,
    'master'
  ]);

  if (inserts.length > 0) {
    await db.query(`
      INSERT INTO order_fee_details (
        id,
        order_id,
        component_code,
        component_name,
        default_amount,
        amount,
        is_editable,
        source
      ) VALUES ?
    `, [inserts]);
  }
}
```

---

## 19. Logic Generate Checklist Dokumen

Saat order dibuat, ambil data dari `m_service_document_requirement`, lalu copy ke `order_document_checklist`.

```js
async function generateOrderDocumentChecklist(orderId, serviceCode) {
  const docs = await db.query(`
    SELECT
      document_code,
      document_name,
      is_required,
      sort_order
    FROM m_service_document_requirement
    WHERE service_code = ?
      AND is_active = 1
    ORDER BY sort_order ASC
  `, [serviceCode]);

  const inserts = docs.map((doc) => [
    crypto.randomUUID(),
    orderId,
    doc.document_code,
    doc.document_name,
    doc.is_required,
    0
  ]);

  if (inserts.length > 0) {
    await db.query(`
      INSERT INTO order_document_checklist (
        id,
        order_id,
        document_code,
        document_name,
        is_required,
        is_checked
      ) VALUES ?
    `, [inserts]);
  }
}
```

---

## 20. Logic Recalculate Total Order

Setiap ada perubahan biaya, total order harus dihitung ulang dari `order_fee_details.amount`.

```js
async function recalculateOrderTotal(orderId) {
  const result = await db.query(`
    SELECT COALESCE(SUM(amount), 0) AS total
    FROM order_fee_details
    WHERE order_id = ?
  `, [orderId]);

  const total = result[0]?.total || 0;

  await db.query(`
    UPDATE orders
    SET total_amount = ?
    WHERE id = ?
  `, [total, orderId]);
}
```

---

## 21. UI Requirement

### 21.1 Halaman Buat Order

Field minimal:

```text
Jenis Layanan
Tipe Kendaraan
Provinsi
Kota/Kabupaten Samsat
Nomor Polisi
Nama Pemilik
Tanggal Jatuh Tempo Pajak
Nama Pemohon
No WhatsApp
Alamat Pengambilan Dokumen
Alamat Pengantaran Dokumen
Catatan
```

Setelah jenis layanan dan tipe kendaraan dipilih, sistem boleh menampilkan estimasi biaya default.

---

### 21.2 Halaman Detail Order

Tampilkan:

```text
Data order
Data kendaraan
Rincian biaya
Checklist dokumen
Status order
Riwayat status
```

---

### 21.3 Rincian Biaya

Semua item biaya tampil sebagai input editable.

Contoh:

```text
PKB                    Rp 0
SWDKLLJ                Rp 35.000
Denda PKB              Rp 0
Denda SWDKLLJ          Rp 0
STNK                   Rp 100.000
TNKB / Plat            Rp 60.000
Jasa Biro              Rp 150.000
Operasional            Rp 50.000
Total                  Rp 395.000
```

Ketika nominal diedit, total harus update otomatis.

---

### 21.4 Checklist Dokumen

Tampilkan checkbox.

Contoh:

```text
[ ] STNK Asli
[ ] KTP Asli / Fotokopi KTP
[ ] BPKB Asli
[ ] Hasil Cek Fisik
```

Tidak perlu upload foto/file pada MVP.

---

## 22. Rules untuk Agent

Agent yang mengerjakan fitur ini wajib mengikuti aturan berikut:

1. Jangan hardcode biaya langsung di frontend.
2. Semua biaya default harus berasal dari `m_fee_rules`.
3. Saat order dibuat, biaya dari master harus dicopy ke `order_fee_details`.
4. Total order dihitung dari `order_fee_details.amount`, bukan dari master.
5. Semua biaya transaksi harus bisa diedit oleh pemakai aplikasi/admin.
6. `default_amount` jangan diubah setelah transaksi dibuat.
7. Jika user/admin edit biaya, ubah field `amount`.
8. Setelah biaya diedit, jalankan ulang kalkulasi total order.
9. Jangan membuat fitur upload dokumen dulu.
10. Dokumen cukup dibuat checklist menggunakan `order_document_checklist`.
11. Checklist dokumen berasal dari `m_service_document_requirement`.
12. Base awal wilayah adalah Jawa Barat dengan `province_code = JABAR`.
13. PKB, denda, dan tunggakan default 0 dan harus editable.
14. Jasa biro dan operasional berasal dari master database, tetapi tetap editable.
15. Transaksi lama tidak boleh berubah ketika master harga diubah.
16. Master harga hanya menjadi template/default untuk transaksi baru.
17. Detail biaya transaksi adalah sumber kebenaran untuk total order.
18. Jika ada kondisi khusus, tambahkan `BIAYA_TAMBAHAN` atau ubah `amount` pada detail biaya.
19. Semua perubahan biaya harus tersimpan agar bisa diaudit.
20. UI harus menampilkan rincian biaya dan checklist dokumen secara jelas.

---

## 23. Kesimpulan Final

Desain final yang digunakan:

```text
Master harga:
m_fee_rules

Transaksi biaya:
order_fee_details

Master checklist dokumen:
m_service_document_requirement

Checklist dokumen transaksi:
order_document_checklist

Total order:
SUM(order_fee_details.amount)

Dokumen:
Checklist saja, belum upload foto/file

Base wilayah:
Jawa Barat / JABAR

Biaya jasa dan operasional:
Ambil dari database, tapi bisa diedit

Biaya resmi:
Ditempel otomatis dari master, tapi tetap bisa diedit

PKB dan denda:
Default 0, wajib editable
```

Dengan desain ini sistem tetap:
- Rapi
- Fleksibel
- Mudah dikembangkan
- Aman untuk transaksi lama
- Cocok untuk MVP
- Mudah dibaca dan diikuti oleh agent

---

## 24. Revisi Implementasi Fee Manual

> Updated: 2026-05-17

Implementasi terbaru menggunakan master fee sebagai template komponen, bukan sebagai nominal final yang terkunci.

Aturan terbaru:

```text
m_fee_rules.default_amount -> initial value input mobile
mobile user/admin mengubah amount jika perlu
payload create transaksi mengirim feeDetails amount
backend menyimpan defaultAmount + amount ke transaction_item_fee_details
total transaksi dihitung dari SUM(amount)
```

Komponen pajak/resmi yang ditampilkan sebagai input manual mengikuti format notice pajak:

```text
PKB_POKOK
PKB_DENDA
OPSEN_PKB_POKOK
OPSEN_PKB_DENDA
SWDKLLJ_POKOK
SWDKLLJ_DENDA
PNBP_STNK
PNBP_TNKB
```

`OPERASIONAL` tidak digunakan di flow terbaru. Biaya layanan hanya memakai `JASA_BIRO`. Nilai `JASA_BIRO` berasal dari konfigurasi harga tenant/aturan harga mobile (`pricing_rules`), ditampilkan sebagai biaya sistem, dan tidak dicampur dengan input notice/STNK.

---

## 25. Catatan Implementasi Codebase Saat Ini

Di repository ini, konsep `orders` pada desain dimap ke tabel transaksi existing:

```text
orders                         -> transactions
order_fee_details              -> transaction_item_fee_details
order_document_checklist       -> transaction_item_document_checklists
m_service_type                 -> service_types
m_fee_rules                    -> m_fee_rules
m_service_document_requirement -> m_service_document_requirements
```

Fee dan checklist dibuat per `transaction_items` karena satu transaksi dapat memiliki beberapa kendaraan/layanan. Mobile hanya mengambil estimasi dari backend dan tidak mengedit fee manual; edit nominal `amount` disiapkan untuk FE Admin. Base seed awal tetap `JABAR`, tetapi tabel master menyimpan `provinceCode`, `cityCode`, `vehicleTypeCode`, dan `priceGroup` agar data provinsi lain bisa ditambahkan tanpa perubahan schema.
