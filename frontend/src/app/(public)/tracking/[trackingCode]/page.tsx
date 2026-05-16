'use client';

import Image from 'next/image';
import icon from '../../../../../assets/icon.png';
import { useTracking } from '../../../../modules/tracking/hooks/useTracking';
import { LoadingState } from '../../../../shared/components/LoadingState';
import { ErrorState } from '../../../../shared/components/ErrorState';
import { formatCurrency, formatDateTime } from '../../../../shared/utils/format';
import { AppError } from '../../../../shared/services/api';
import { Colors } from '../../../../shared/theme';

const STATUS_LABEL: Record<string, string> = {
  DRAFT: 'Draft',
  ON_PROCESS: 'Sedang Diproses',
  READY_TO_PICKUP: 'Siap Diambil',
  COMPLETED: 'Selesai',
  CLOSED: 'Ditutup',
};

const STATUS_COLOR: Record<string, string> = {
  DRAFT: '#8A8F9C',
  ON_PROCESS: Colors.warning,
  READY_TO_PICKUP: Colors.info,
  COMPLETED: Colors.success,
  CLOSED: '#263238',
};

const STATUS_STEPS = ['DRAFT', 'ON_PROCESS', 'READY_TO_PICKUP', 'COMPLETED', 'CLOSED'];

interface PageProps {
  params: { trackingCode: string };
}

function getStatusIndex(status: string) {
  const index = STATUS_STEPS.indexOf(status);
  return index >= 0 ? index : 0;
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.infoTile}>
      <div style={styles.microLabel}>{label}</div>
      <div style={styles.infoValue}>{value}</div>
    </div>
  );
}

function PaymentRow({ label, value, tone }: { label: string; value: string; tone?: 'success' | 'warning' }) {
  return (
    <div style={styles.paymentRow}>
      <span style={styles.paymentLabel}>{label}</span>
      <span
        style={{
          ...styles.paymentValue,
          color: tone === 'success' ? Colors.success : tone === 'warning' ? Colors.warning : Colors.text,
        }}
      >
        {value}
      </span>
    </div>
  );
}

export default function TrackingPage({ params }: PageProps) {
  const { trackingCode } = params;
  const { data, isLoading, error, refetch } = useTracking(trackingCode);

  if (isLoading) return <LoadingState message="Memuat info tracking..." />;
  if (error || !data)
    return (
      <ErrorState
        message={(error as unknown as AppError)?.message ?? 'Tracking tidak ditemukan'}
        onRetry={refetch}
      />
    );

  const statusColor = STATUS_COLOR[data.status] ?? Colors.primary;
  const statusIndex = getStatusIndex(data.status);
  const primaryItem = data.items[0];
  const plateNumber = primaryItem?.vehicle?.plateNumber ?? '-';
  const vehicleName = primaryItem?.vehicle
    ? `${primaryItem.vehicle.brand} ${primaryItem.vehicle.model}`
    : 'Kendaraan terdaftar';

  return (
    <div style={styles.page}>
      <div style={styles.bgOrbOne} />
      <div style={styles.bgOrbTwo} />

      <main style={styles.shell}>
        <section style={styles.hero}>
          <div style={styles.brandRow}>
            <div style={styles.systemLogoWrap}>
              <Image src={icon} alt="SatuJasa" width={46} height={46} style={styles.systemLogo} priority />
            </div>
            <div>
              <div style={styles.systemName}>SatuJasa</div>
              <div style={styles.tenantSubtitle}>{data.tenant.name} • Live tracking pengurusan STNK</div>
            </div>
          </div>

          <div style={styles.heroGrid}>
            <div>
              <div style={styles.microLabelLight}>Invoice</div>
              <h1 style={styles.invoiceTitle}>{data.invoiceNumber}</h1>
              <p style={styles.heroCopy}>
                Pantau status pengerjaan kendaraan Anda secara real-time tanpa perlu menghubungi admin.
              </p>
            </div>
            <div style={styles.statusPanel}>
              <div style={{ ...styles.statusBadge, background: `${statusColor}18`, color: statusColor, borderColor: `${statusColor}55` }}>
                {STATUS_LABEL[data.status] ?? data.status}
              </div>
              <div style={styles.plateBox}>{plateNumber}</div>
              <div style={styles.vehicleName}>{vehicleName}</div>
            </div>
          </div>
        </section>

        <section style={styles.progressCard}>
          <div style={styles.sectionHeader}>
            <div>
              <div style={styles.microLabel}>Progress</div>
              <h2 style={styles.sectionTitle}>Status Pengerjaan</h2>
            </div>
            <div style={styles.trackingChip}>#{trackingCode}</div>
          </div>

          <div style={styles.stepGrid}>
            {STATUS_STEPS.map((step, index) => {
              const isDone = index <= statusIndex;
              const isCurrent = index === statusIndex;
              return (
                <div key={step} style={styles.stepItem}>
                  <div
                    style={{
                      ...styles.stepDot,
                      background: isDone ? statusColor : '#DDE4F0',
                      boxShadow: isCurrent ? `0 0 0 8px ${statusColor}18` : 'none',
                    }}
                  />
                  <div style={{ ...styles.stepLabel, color: isDone ? Colors.text : Colors.textLight }}>
                    {STATUS_LABEL[step]}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <div style={styles.contentGrid}>
          <section style={styles.card}>
            <div style={styles.sectionHeaderCompact}>
              <div>
                <div style={styles.microLabel}>Detail Pelanggan</div>
                <h2 style={styles.sectionTitle}>Ringkasan Transaksi</h2>
              </div>
            </div>
            <div style={styles.infoGrid}>
              <InfoTile label="Customer" value={data.customer.name} />
              <InfoTile label="Plat Nomor" value={plateNumber} />
              <InfoTile label="Cabang" value={data.branch.name} />
              <InfoTile
                label="Estimasi Selesai"
                value={data.estimatedFinishDate ? formatDateTime(data.estimatedFinishDate) : 'Belum ditentukan'}
              />
            </div>
          </section>

          <section style={styles.card}>
            <div style={styles.sectionHeaderCompact}>
              <div>
                <div style={styles.microLabel}>Pembayaran</div>
                <h2 style={styles.sectionTitle}>Informasi Biaya</h2>
              </div>
            </div>
            <div style={styles.paymentBox}>
              <PaymentRow label="Total Estimasi" value={formatCurrency(data.estimatedTotal)} />
              <PaymentRow label="DP Dibayar" value={`- ${formatCurrency(data.dpAmount)}`} tone="success" />
              <PaymentRow
                label="Sisa Bayar"
                value={formatCurrency(data.remainingAmount)}
                tone={data.remainingAmount > 0 ? 'warning' : 'success'}
              />
              {data.refundAmount > 0 && <PaymentRow label="Refund" value={formatCurrency(data.refundAmount)} tone="success" />}
            </div>
          </section>
        </div>

        {data.items.length > 0 && (
          <section style={styles.card}>
            <div style={styles.sectionHeaderCompact}>
              <div>
                <div style={styles.microLabel}>Kendaraan</div>
                <h2 style={styles.sectionTitle}>Layanan yang Diproses</h2>
              </div>
            </div>
            <div style={styles.itemList}>
              {data.items.map((item, index) => (
                <div key={`${item.vehicle?.plateNumber ?? 'vehicle'}-${index}`} style={styles.serviceRow}>
                  <div style={styles.servicePlate}>{item.vehicle?.plateNumber ?? '-'}</div>
                  <div style={styles.serviceBody}>
                    <div style={styles.serviceName}>{item.serviceType?.name ?? 'Layanan STNK'}</div>
                    <div style={styles.serviceMeta}>
                      {item.vehicle ? `${item.vehicle.brand} ${item.vehicle.model}` : 'Data kendaraan'}
                    </div>
                  </div>
                  <div style={styles.serviceAmount}>{formatCurrency(item.price)}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {data.timeline?.length > 0 && (
          <section style={styles.card}>
            <div style={styles.sectionHeaderCompact}>
              <div>
                <div style={styles.microLabel}>Timeline</div>
                <h2 style={styles.sectionTitle}>Riwayat Status</h2>
              </div>
            </div>
            <div style={styles.timelineList}>
              {data.timeline.map((item, index) => (
                <div key={`${item.toStatus}-${item.createdAt}-${index}`} style={styles.timelineRow}>
                  <div style={styles.timelineRail}>
                    <div style={{ ...styles.timelineDot, background: STATUS_COLOR[item.toStatus] ?? Colors.primary }} />
                    {index < data.timeline.length - 1 && <div style={styles.timelineLine} />}
                  </div>
                  <div style={styles.timelineBody}>
                    <div style={styles.timelineTitle}>{STATUS_LABEL[item.toStatus] ?? item.toStatus}</div>
                    {item.notes && <div style={styles.timelineNotes}>{item.notes}</div>}
                    <div style={styles.timelineDate}>{formatDateTime(item.createdAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <footer style={styles.footer}>
          <div>{data.branch.address || 'Alamat cabang belum tersedia'}</div>
          <strong>{data.branch.phone || data.tenant.name}</strong>
        </footer>

        <div style={styles.creditFooter}>
          <div style={styles.creditBrand}>SatuJasa by Zidan Ferdiansyah</div>
          <div style={styles.creditContact}>
            <span>Email: zidanferdi13@gmail.com</span>
            <span>WhatsApp: +6281319535441</span>
          </div>
        </div>
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    position: 'relative',
    overflow: 'hidden',
    background: 'linear-gradient(135deg, #EAF2FF 0%, #F7FAFF 42%, #FFFFFF 100%)',
    color: Colors.text,
  },
  bgOrbOne: {
    position: 'absolute',
    width: 420,
    height: 420,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(0,122,255,0.18), rgba(0,122,255,0))',
    top: -180,
    right: -120,
  },
  bgOrbTwo: {
    position: 'absolute',
    width: 360,
    height: 360,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(76,175,80,0.14), rgba(76,175,80,0))',
    bottom: -170,
    left: -140,
  },
  shell: {
    position: 'relative',
    maxWidth: 1040,
    margin: '0 auto',
    padding: '32px 20px 28px',
  },
  hero: {
    borderRadius: 32,
    padding: 28,
    background: `linear-gradient(145deg, ${Colors.primaryDark}, ${Colors.primary})`,
    color: '#FFFFFF',
    boxShadow: '0 24px 70px rgba(0, 86, 204, 0.28)',
    border: '1px solid rgba(255,255,255,0.28)',
  },
  brandRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    marginBottom: 34,
  },
  systemLogoWrap: {
    width: 54,
    height: 54,
    borderRadius: 20,
    display: 'grid',
    placeItems: 'center',
    background: 'rgba(255,255,255,0.18)',
    border: '1px solid rgba(255,255,255,0.35)',
  },
  systemLogo: {
    width: 46,
    height: 46,
    borderRadius: 16,
    objectFit: 'cover',
  },
  systemName: { fontSize: 22, fontWeight: 950, letterSpacing: -0.4 },
  tenantSubtitle: { fontSize: 13, opacity: 0.82, marginTop: 2 },
  heroGrid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) minmax(260px, 0.72fr)',
    gap: 24,
    alignItems: 'end',
  },
  microLabelLight: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    fontWeight: 900,
    opacity: 0.72,
  },
  invoiceTitle: {
    margin: '8px 0 12px',
    maxWidth: '100%',
    overflowWrap: 'anywhere',
    fontSize: 'clamp(30px, 5.2vw, 52px)',
    lineHeight: 1.02,
    letterSpacing: -1.8,
    fontWeight: 950,
  },
  heroCopy: {
    maxWidth: 520,
    fontSize: 15,
    lineHeight: 1.7,
    opacity: 0.84,
  },
  statusPanel: {
    borderRadius: 26,
    padding: 18,
    background: 'rgba(255,255,255,0.96)',
    color: Colors.text,
    border: '1px solid rgba(255,255,255,0.7)',
  },
  statusBadge: {
    display: 'inline-flex',
    border: '1px solid',
    borderRadius: 999,
    padding: '8px 12px',
    fontSize: 12,
    fontWeight: 900,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  plateBox: {
    marginTop: 18,
    borderRadius: 18,
    padding: '18px 16px',
    background: '#111827',
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: 950,
    letterSpacing: 1.8,
    textAlign: 'center',
    boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.16)',
  },
  vehicleName: {
    marginTop: 10,
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: 700,
    textAlign: 'center',
  },
  progressCard: {
    marginTop: 18,
    borderRadius: 28,
    padding: 24,
    background: 'rgba(255,255,255,0.9)',
    border: '1px solid #D9E2F1',
    boxShadow: '0 18px 55px rgba(20, 42, 74, 0.09)',
    backdropFilter: 'blur(12px)',
  },
  card: {
    borderRadius: 28,
    padding: 24,
    background: 'rgba(255,255,255,0.94)',
    border: '1px solid #D9E2F1',
    boxShadow: '0 18px 55px rgba(20, 42, 74, 0.08)',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 16,
    alignItems: 'flex-start',
    marginBottom: 22,
  },
  sectionHeaderCompact: { marginBottom: 18 },
  microLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    fontWeight: 900,
    color: Colors.textLight,
  },
  sectionTitle: {
    margin: '4px 0 0',
    fontSize: 22,
    lineHeight: 1.15,
    letterSpacing: -0.7,
    fontWeight: 950,
  },
  trackingChip: {
    borderRadius: 999,
    padding: '9px 13px',
    background: '#EEF5FF',
    color: Colors.primaryDark,
    fontSize: 12,
    fontWeight: 900,
    border: '1px solid #CFE0F8',
  },
  stepGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: 10,
  },
  stepItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
    textAlign: 'center',
  },
  stepDot: { width: 15, height: 15, borderRadius: '50%' },
  stepLabel: { fontSize: 12, fontWeight: 900, lineHeight: 1.25 },
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 18,
    marginTop: 18,
    marginBottom: 18,
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 12,
  },
  infoTile: {
    borderRadius: 18,
    padding: 14,
    background: '#F7FAFF',
    border: '1px solid #E0E8F5',
  },
  infoValue: { marginTop: 6, fontSize: 15, lineHeight: 1.35, fontWeight: 850 },
  paymentBox: {
    borderRadius: 20,
    padding: 16,
    background: '#F7FAFF',
    border: '1px solid #E0E8F5',
  },
  paymentRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 16,
    padding: '10px 0',
    borderBottom: '1px solid #E6EDF7',
  },
  paymentLabel: { color: Colors.textSecondary, fontSize: 14, fontWeight: 700 },
  paymentValue: { fontSize: 15, fontWeight: 900, textAlign: 'right' },
  itemList: { display: 'flex', flexDirection: 'column', gap: 12 },
  serviceRow: {
    display: 'grid',
    gridTemplateColumns: '150px minmax(0, 1fr) auto',
    gap: 14,
    alignItems: 'center',
    borderRadius: 20,
    padding: 14,
    background: '#F7FAFF',
    border: '1px solid #E0E8F5',
  },
  servicePlate: {
    borderRadius: 14,
    padding: '12px 10px',
    background: '#111827',
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 950,
    letterSpacing: 1.2,
    textAlign: 'center',
  },
  serviceBody: { minWidth: 0 },
  serviceName: { fontSize: 15, fontWeight: 900 },
  serviceMeta: { marginTop: 4, color: Colors.textSecondary, fontSize: 13, fontWeight: 600 },
  serviceAmount: { color: Colors.primaryDark, fontSize: 15, fontWeight: 950, textAlign: 'right' },
  timelineList: { display: 'flex', flexDirection: 'column' },
  timelineRow: { display: 'flex', gap: 14 },
  timelineRail: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  timelineDot: { width: 13, height: 13, borderRadius: '50%', marginTop: 5 },
  timelineLine: { width: 2, flex: 1, minHeight: 42, background: '#DDE6F3', marginTop: 5 },
  timelineBody: { flex: 1, paddingBottom: 18 },
  timelineTitle: { fontSize: 15, fontWeight: 900 },
  timelineNotes: { marginTop: 4, color: Colors.textSecondary, fontSize: 14, lineHeight: 1.5 },
  timelineDate: { marginTop: 6, color: Colors.textLight, fontSize: 12, fontWeight: 700 },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 16,
    marginTop: 18,
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 1.5,
  },
  creditFooter: {
    marginTop: 18,
    padding: '18px 20px',
    borderRadius: 24,
    background: 'rgba(255,255,255,0.5)',
    border: '1px solid rgba(217,226,241,0.7)',
    color: 'rgba(51,51,51,0.62)',
    textAlign: 'center',
    backdropFilter: 'blur(12px)',
  },
  creditBrand: {
    fontSize: 13,
    fontWeight: 900,
    letterSpacing: 0.2,
  },
  creditContact: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: '6px 16px',
    marginTop: 6,
    fontSize: 12,
    fontWeight: 700,
  },
};
