import { AsyncLocalStorage } from 'async_hooks';

export interface TenantContext {
  tenantId: string;
  userId: string;
  role: string;
}

export const tenantContextStorage = new AsyncLocalStorage<TenantContext>();

export const runWithTenant = <T>(context: TenantContext, callback: () => T): T =>
  tenantContextStorage.run(context, callback);

export const getTenantContext = () => tenantContextStorage.getStore();

export const getCurrentTenantId = () => getTenantContext()?.tenantId;

export const isSuperAdminContext = () => getTenantContext()?.role === 'SUPER_ADMIN';
