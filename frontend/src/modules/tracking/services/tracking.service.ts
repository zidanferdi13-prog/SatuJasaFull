import api from '../../../shared/services/api';

export interface TrackingItem {
  vehicle: { plateNumber: string; model: string; brand: string };
  serviceType: { name: string };
  price: number;
}

export interface TrackingPayment {
  amount: number;
  type: string;
  method: string;
  createdAt: string;
}

export interface TrackingTimeline {
  fromStatus: string | null;
  toStatus: string;
  notes: string | null;
  createdAt: string;
}

export interface TrackingInfo {
  invoiceNumber: string;
  trackingCode: string;
  status: string;
  estimatedFinishDate: string | null;
  estimatedTotal: number;
  dpAmount: number;
  remainingAmount: number;
  refundAmount: number;
  finalTotal: number;
  createdAt: string;
  tenant: { name: string; logoUrl: string | null; code: string };
  branch: { name: string; address: string | null; phone: string | null };
  customer: { name: string };
  items: TrackingItem[];
  payments: TrackingPayment[];
  timeline: TrackingTimeline[];
}

export const trackingService = {
  // Public — no auth required
  getByCode: (trackingCode: string): Promise<TrackingInfo> =>
    api.get(`/tracking/${trackingCode}`).then((r) => r.data.data),
};
