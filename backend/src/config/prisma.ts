import { PrismaClient } from '@prisma/client';
import { env } from './env';
import { getCurrentTenantId, isSuperAdminContext } from './tenant-context';

const tenantScopedModels = new Set([
  'User',
  'Branch',
  'Customer',
  'Vehicle',
  'Transaction',
  'TransactionDocument',
  'ServiceType',
  'PricingRule',
  'MasterFeeRule',
  'MasterServiceDocumentRequirement',
  'InvoiceSequence',
  'Subscription',
  'WhatsappQueue',
  'AuditLog',
]);

const softDeleteModels = new Set([
  'User',
  'Branch',
  'Customer',
  'Vehicle',
  'Transaction',
  'TransactionDocument',
  'ServiceType',
  'PricingRule',
  'MasterFeeRule',
]);

const basePrisma = new PrismaClient({
  log: env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
});

const addTenantScope = (args: any, tenantId: string) => ({
  ...args,
  where: {
    ...(args?.where ?? {}),
    tenantId,
  },
});

const addSoftDeleteScope = (args: any) => ({
  ...args,
  where: {
    ...(args?.where ?? {}),
    deletedAt: null,
  },
});

const applyReadScopes = (model: string, args: any) => {
  let scopedArgs = args;
  if (softDeleteModels.has(model)) scopedArgs = addSoftDeleteScope(scopedArgs);

  const tenantId = getCurrentTenantId();
  if (tenantId && !isSuperAdminContext() && tenantScopedModels.has(model)) {
    scopedArgs = addTenantScope(scopedArgs, tenantId);
  }

  return scopedArgs;
};

const delegateName = (model: string) => `${model.charAt(0).toLowerCase()}${model.slice(1)}`;

const prisma = basePrisma.$extends({
  name: 'tenantIsolation',
  query: {
    $allModels: {
      async findFirst({ model, args, query }) {
        return query(applyReadScopes(model, args));
      },
      async findMany({ model, args, query }) {
        return query(applyReadScopes(model, args));
      },
      async count({ model, args, query }) {
        return query(applyReadScopes(model, args));
      },
      async aggregate({ model, args, query }) {
        return query(applyReadScopes(model, args));
      },
      async updateMany({ model, args, query }) {
        const tenantId = getCurrentTenantId();
        if (tenantId && !isSuperAdminContext() && tenantScopedModels.has(model)) {
          return query(addTenantScope(args, tenantId));
        }
        return query(args);
      },
      async delete({ model, args }) {
        if (softDeleteModels.has(model)) {
          return (basePrisma as any)[delegateName(model)].update({
            where: args.where,
            data: { deletedAt: new Date() },
          });
        }
        return (basePrisma as any)[delegateName(model)].delete(args);
      },
      async deleteMany({ model, args }) {
        let scopedArgs = args;
        const tenantId = getCurrentTenantId();
        if (tenantId && !isSuperAdminContext() && tenantScopedModels.has(model)) {
          scopedArgs = addTenantScope(scopedArgs, tenantId);
        }
        if (softDeleteModels.has(model)) {
          return (basePrisma as any)[delegateName(model)].updateMany({
            where: scopedArgs.where,
            data: { deletedAt: new Date() },
          });
        }
        return (basePrisma as any)[delegateName(model)].deleteMany(scopedArgs);
      },
    },
  },
});

export const rawPrisma = basePrisma;
export default prisma;
