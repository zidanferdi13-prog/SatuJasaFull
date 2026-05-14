import api from '../../../shared/services/api';

export interface ServiceType {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

export interface PricingRule {
  id: string;
  tenantId: string;
  serviceTypeId: string;
  branchId?: string;
  price: number;
  createdAt: string;
}

export const serviceTypeService = {
  // GET /service-types
  list: (): Promise<ServiceType[]> =>
    api.get('/service-types').then((r) => r.data.data),

  // POST /service-types
  create: (data: { name: string; description?: string }): Promise<ServiceType> =>
    api.post('/service-types', data).then((r) => r.data.data),

  // PUT /service-types/:id
  update: (id: string, data: { name?: string; description?: string }): Promise<ServiceType> =>
    api.put(`/service-types/${id}`, data).then((r) => r.data.data),

  // PATCH /service-types/:id/status
  updateStatus: (id: string, isActive: boolean): Promise<ServiceType> =>
    api.patch(`/service-types/${id}/status`, { isActive }).then((r) => r.data.data),
};

export const pricingService = {
  // GET /pricing-rules
  list: (): Promise<PricingRule[]> =>
    api.get('/pricing-rules').then((r) => r.data.data),

  // POST /pricing-rules
  create: (data: { serviceTypeId: string; price: number; branchId?: string }): Promise<PricingRule> =>
    api.post('/pricing-rules', data).then((r) => r.data.data),

  // PUT /pricing-rules/:id
  update: (id: string, data: { price: number }): Promise<PricingRule> =>
    api.put(`/pricing-rules/${id}`, data).then((r) => r.data.data),
};
