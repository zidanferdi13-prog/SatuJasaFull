import apiClient from '../../../shared/services/api-client';
import { useAuthStore } from '../../../store/authStore';
import { ApiResponse, PricingRule, ServiceType, Tenant } from '../../../shared/types';

const getTenantId = (): string => {
  const tenantId = useAuthStore.getState().user?.tenantId;
  if (!tenantId) throw new Error('Tenant ID not found in auth store');
  return tenantId;
};

export const settingsService = {
  // Service Types (read-only for tenants)
  getServiceTypes: async (): Promise<ServiceType[]> => {
    const { data } = await apiClient.get<ApiResponse<ServiceType[]>>('/service-types');
    return data.data || [];
  },

  // Pricing Rules
  getPricingRules: async (): Promise<PricingRule[]> => {
    const { data } = await apiClient.get<ApiResponse<PricingRule[]>>('/pricing-rules');
    return data.data || [];
  },

  createPricingRule: async (payload: { serviceTypeId: string; price: number }): Promise<PricingRule> => {
    const { data } = await apiClient.post<ApiResponse<PricingRule>>('/pricing-rules', payload);
    return data.data;
  },

  updatePricingRule: async (id: string, payload: { price: number; isActive?: boolean }): Promise<PricingRule> => {
    const { data } = await apiClient.put<ApiResponse<PricingRule>>(`/pricing-rules/${id}`, payload);
    return data.data;
  },

  // Tenant profile — uses GET /tenants/:id (no /tenants/me endpoint in API)
  getTenant: async (): Promise<Tenant> => {
    const tenantId = getTenantId();
    const { data } = await apiClient.get<ApiResponse<Tenant>>(`/tenants/${tenantId}`);
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

  // Subscription data is part of the tenant object — no dedicated endpoint exists
  getSubscription: async (): Promise<Pick<Tenant, 'subscriptionStatus' | 'subscriptionEnd' | 'subscriptionStart'>> => {
    const tenantId = getTenantId();
    const { data } = await apiClient.get<ApiResponse<Tenant>>(`/tenants/${tenantId}`);
    const tenant = data.data;
    return {
      subscriptionStatus: tenant.subscriptionStatus,
      subscriptionEnd: tenant.subscriptionEnd,
      subscriptionStart: tenant.subscriptionStart,
    };
  },
};
