import { OpenAPIRegistry, OpenApiGeneratorV3, extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import {
  loginSchema,
  refreshTokenSchema,
  registerTenantSchema,
} from '../modules/auth/auth.schema';
import {
  createCustomerSchema,
  updateCustomerSchema,
} from '../modules/customer/customer.schema';
import {
  createVehicleSchema,
  updateVehicleSchema,
} from '../modules/vehicle/vehicle.schema';
import {
  createPricingRuleSchema,
  updatePricingRuleSchema,
} from '../modules/pricing/pricing.schema';
import {
  assignTransactionSchema,
  cancelTransactionSchema,
  createTransactionSchema,
  finalizeTransactionSchema,
  updateDocumentChecklistSchema,
  updateTransactionStatusSchema,
} from '../modules/transaction/transaction.schema';
import { createPaymentSchema } from '../modules/payment/payment.schema';
import { registerDeviceSchema } from '../modules/notification/notification.schema';

extendZodWithOpenApi(z);

const registry = new OpenAPIRegistry();

registry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
});

const idParam = z.object({ id: z.string().uuid() });
const checklistParam = z.object({ id: z.string().uuid(), checklistId: z.string().uuid() });
const paymentTransactionParam = z.object({ id: z.string().uuid() });

const successResponse = (description: string) => ({
  description,
  content: {
    'application/json': {
      schema: z.object({
        success: z.boolean(),
        message: z.string().optional(),
        data: z.unknown().optional(),
      }),
    },
  },
});

const paginatedResponse = (description: string) => ({
  description,
  content: {
    'application/json': {
      schema: z.object({
        success: z.boolean(),
        data: z.array(z.unknown()),
        pagination: z.object({
          total: z.number(),
          page: z.number(),
          limit: z.number(),
          totalPages: z.number(),
        }).optional(),
      }),
    },
  },
});

const registerJsonRoute = ({
  method,
  path,
  tag,
  summary,
  schema,
  responseDescription,
}: {
  method: 'get' | 'post' | 'put' | 'patch' | 'delete';
  path: string;
  tag: string;
  summary: string;
  schema?: z.ZodObject<any>;
  responseDescription: string;
}) => {
  const bodySchema = schema?.shape.body as z.ZodTypeAny | undefined;

  registry.registerPath({
    method,
    path,
    tags: [tag],
    summary,
    request: {
      ...(bodySchema ? { body: { content: { 'application/json': { schema: bodySchema } } } } : {}),
      ...(path.includes('{id}') ? { params: idParam } : {}),
      ...(path.includes('{checklistId}') ? { params: checklistParam } : {}),
    },
    responses: {
      200: successResponse(responseDescription),
      400: successResponse('Validation error'),
      401: successResponse('Unauthorized'),
      404: successResponse('Not found'),
    },
  });
};

registry.registerPath({
  method: 'get',
  path: '/customers',
  tags: ['Customers'],
  summary: 'List customers',
  responses: { 200: paginatedResponse('Customers list') },
});
registerJsonRoute({ method: 'post', path: '/customers', tag: 'Customers', summary: 'Create customer', schema: createCustomerSchema, responseDescription: 'Customer created' });
registerJsonRoute({ method: 'put', path: '/customers/{id}', tag: 'Customers', summary: 'Update customer', schema: updateCustomerSchema, responseDescription: 'Customer updated' });

registry.registerPath({
  method: 'get',
  path: '/vehicles',
  tags: ['Vehicles'],
  summary: 'List vehicles',
  responses: { 200: paginatedResponse('Vehicles list') },
});
registerJsonRoute({ method: 'post', path: '/vehicles', tag: 'Vehicles', summary: 'Create vehicle', schema: createVehicleSchema, responseDescription: 'Vehicle created' });
registerJsonRoute({ method: 'put', path: '/vehicles/{id}', tag: 'Vehicles', summary: 'Update vehicle', schema: updateVehicleSchema, responseDescription: 'Vehicle updated' });

registry.registerPath({
  method: 'get',
  path: '/pricing-rules',
  tags: ['Pricing'],
  summary: 'List pricing rules',
  responses: { 200: successResponse('Pricing rules list') },
});
registerJsonRoute({ method: 'post', path: '/pricing-rules', tag: 'Pricing', summary: 'Create pricing rule', schema: createPricingRuleSchema, responseDescription: 'Pricing rule created' });
registerJsonRoute({ method: 'put', path: '/pricing-rules/{id}', tag: 'Pricing', summary: 'Update pricing rule', schema: updatePricingRuleSchema, responseDescription: 'Pricing rule updated' });

registry.registerPath({
  method: 'get',
  path: '/transactions',
  tags: ['Transactions'],
  summary: 'List transactions',
  responses: { 200: paginatedResponse('Transactions list') },
});
registerJsonRoute({ method: 'post', path: '/transactions', tag: 'Transactions', summary: 'Create transaction', schema: createTransactionSchema, responseDescription: 'Transaction created' });
registerJsonRoute({ method: 'patch', path: '/transactions/{id}/status', tag: 'Transactions', summary: 'Update transaction status', schema: updateTransactionStatusSchema, responseDescription: 'Transaction status updated' });
registerJsonRoute({ method: 'post', path: '/transactions/{id}/finalize', tag: 'Transactions', summary: 'Finalize transaction', schema: finalizeTransactionSchema, responseDescription: 'Transaction finalized' });
registerJsonRoute({ method: 'post', path: '/transactions/{id}/cancel', tag: 'Transactions', summary: 'Cancel transaction', schema: cancelTransactionSchema, responseDescription: 'Transaction cancelled' });
registerJsonRoute({ method: 'patch', path: '/transactions/{id}/assign', tag: 'Transactions', summary: 'Assign transaction PIC', schema: assignTransactionSchema, responseDescription: 'Transaction assigned' });
registerJsonRoute({ method: 'patch', path: '/transactions/{id}/document-checklist/{checklistId}', tag: 'Transactions', summary: 'Update document checklist', schema: updateDocumentChecklistSchema, responseDescription: 'Document checklist updated' });
registerJsonRoute({ method: 'post', path: '/transactions/{id}/payments', tag: 'Payments', summary: 'Create payment', schema: createPaymentSchema, responseDescription: 'Payment recorded' });
registry.registerPath({
  method: 'get',
  path: '/transactions/{id}/payments',
  tags: ['Payments'],
  summary: 'List transaction payments',
  request: { params: paymentTransactionParam },
  responses: { 200: successResponse('Payments list') },
});

registerJsonRoute({ method: 'post', path: '/auth/login', tag: 'Auth', summary: 'Login', schema: loginSchema, responseDescription: 'Login success' });
registerJsonRoute({ method: 'post', path: '/auth/refresh', tag: 'Auth', summary: 'Refresh token', schema: refreshTokenSchema, responseDescription: 'Token refreshed' });
registerJsonRoute({ method: 'post', path: '/auth/register-tenant', tag: 'Auth', summary: 'Register tenant', schema: registerTenantSchema, responseDescription: 'Tenant registered' });
registerJsonRoute({ method: 'post', path: '/notifications/devices', tag: 'Notifications', summary: 'Register device token', schema: registerDeviceSchema, responseDescription: 'Device registered' });

const generator = new OpenApiGeneratorV3(registry.definitions);

export const openApiDocument = generator.generateDocument({
  openapi: '3.0.0',
  info: {
    title: 'SatuJasa API',
    version: '1.0.0',
    description: 'Backend API documentation generated from Zod schemas.',
  },
  servers: [{ url: '/api/v1' }],
  security: [{ bearerAuth: [] }],
});
