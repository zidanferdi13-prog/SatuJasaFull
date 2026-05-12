import api from '../../../shared/services/api';
import { Customer } from '../../../shared/types';

export interface CreateCustomerDTO {
  name: string;
  phone: string;
  email?: string;
  address?: string;
}

export const customerService = {
  list: (): Promise<Customer[]> =>
    api.get('/customers').then((r) => r.data.data),

  getById: (id: string): Promise<Customer> =>
    api.get(`/customers/${id}`).then((r) => r.data.data),

  create: (data: CreateCustomerDTO): Promise<Customer> =>
    api.post('/customers', data).then((r) => r.data.data),

  update: (id: string, data: Partial<CreateCustomerDTO>): Promise<Customer> =>
    api.put(`/customers/${id}`, data).then((r) => r.data.data),

  search: (q: string): Promise<Customer[]> =>
    api.get('/customers', { params: { search: q } }).then((r) => r.data.data),
};
