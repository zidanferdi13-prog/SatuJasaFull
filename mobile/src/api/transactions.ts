import client from './client';

export const transactionAPI = {
  list: async (limit = 20, offset = 0) => {
    const response = await client.get('/transactions', {
      params: { limit, offset },
    });
    return response.data;
  },

  get: async (id: string) => {
    const response = await client.get(`/transactions/${id}`);
    return response.data;
  },

  create: async (data: {
    customer_id?: string;
    customer_data?: {
      name: string;
      phone: string;
      email?: string;
      vehicle_number?: string;
    };
    service_id: string;
    payment_method?: string;
  }) => {
    const response = await client.post('/transactions', data);
    return response.data;
  },

  updateStatus: async (id: string, status: string) => {
    const response = await client.put(`/transactions/${id}`, { status });
    return response.data;
  },

  getDailyRevenue: async () => {
    const response = await client.get('/dashboard/revenue');
    return response.data;
  },
};
