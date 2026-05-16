import apiClient from '../../../shared/services/api-client';
import { useAuthStore } from '../../../store/authStore';
import { ApiResponse, PricingRule, ServiceType, Tenant } from '../../../shared/types';

const getTenantId = (): string => {
  const tenantId = useAuthStore.getState().user?.tenantId;
  if (!tenantId) throw new Error('Tenant ID not found in auth store');
  return tenantId;
};

export const settingsService = {
  getServiceTypes: async (): Promise<ServiceType[]> => {
    const { data } = await apiClient.get<ApiResponse<ServiceType[]>>('/service-types');
    return data.data || [];
  },

  createServiceType: async (payload: { name: string; description?: string }): Promise<ServiceType> => {
    const { data } = await apiClient.post<ApiResponse<ServiceType>>('/service-types', payload);
    return data.data;
  },

  // Pricing Rules
  getPricingRules: async (): Promise<PricingRule[]> => {
    const { data } = await apiClient.get<ApiResponse<PricingRule[]>>('/pricing-rules');
    return data.data || [];
  },

  createPricingRule: async (payload: { serviceTypeId: string; marginAmount: number }): Promise<PricingRule> => {
    const { data } = await apiClient.post<ApiResponse<PricingRule>>('/pricing-rules', {
      ...payload,
      price: payload.marginAmount,
    });
    return data.data;
  },

  updatePricingRule: async (id: string, payload: { marginAmount: number; isActive?: boolean }): Promise<PricingRule> => {
    const { data } = await apiClient.put<ApiResponse<PricingRule>>(`/pricing-rules/${id}`, payload);
    return data.data;
  },

    getTenant: async (): Promise<Tenant> => {
    const { data } = await apiClient.get<ApiResponse<Tenant>>('/tenants/me');
    return data.data;
  },

  updateTenant: async (payload: { name?: string; whatsappTemplate?: string }): Promise<Tenant> => {
    const tenantId = getTenantId();
    const { data } = await apiClient.put<ApiResponse<Tenant>>(`/tenants/${tenantId}`, payload);
    return data.data;
  },

  uploadLogo: async (uri: string): Promise<Tenant> => {
    const tenantId = getTenantId();
    const formData = new FormData();
    formData.append('logo', {
      uri,
      type: 'image/jpeg',
      name: 'tenant-logo.jpg',
    } as unknown as Blob);
    const { data } = await apiClient.post<ApiResponse<Tenant>>(`/tenants/${tenantId}/logo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data;
  },

  getSubscription: async (): Promise<Tenant> => {
    const { data } = await apiClient.get<ApiResponse<Tenant>>('/auth/subscription');
    return data.data;
  },
};
