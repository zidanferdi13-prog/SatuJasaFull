import api from '../../../shared/services/api';

export interface TrackingInfo {
  trackingCode: string;
  invoiceNumber: string;
  status: string;
  customerName: string;
  vehiclePlate: string;
  services: string[];
  timeline: Array<{ status: string; timestamp: string; note?: string }>;
  estimatedTotal: number;
  dpAmount: number;
  remainingAmount: number;
  estimatedFinishDate?: string;
  tenantName: string;
  tenantLogoUrl?: string;
}

export const trackingService = {
  // Public — no auth required
  getByCode: (trackingCode: string): Promise<TrackingInfo> =>
    api.get(`/tracking/${trackingCode}`).then((r) => r.data.data),
};
