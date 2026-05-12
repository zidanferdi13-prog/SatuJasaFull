import client from './client';

export const transactionAPI = {
  list: async () => {
    const { data } = await client.get('/transactions');
    return data;
  },

  create: async (payload: {
    customerId: string;
    items: { vehicleId: string; serviceId: string; price: number }[];
    dpAmount: number;
    estimatedFinishDate?: string;
  }) => {
    const { data } = await client.post('/transactions', payload);
    return data;
  },

  updateStatus: async (id: string, status: string, notes?: string) => {
    const { data } = await client.patch(`/transactions/${id}/status`, { status, notes });
    return data;
  },

  getDashboardKpis: async () => {
    const { data } = await client.get('/dashboard/kpis');
    return data;
  },
};
