import apiClient from '../../../shared/services/api-client';
import { ApiResponse, Transaction, Payment, PaginatedMeta, TransactionStatus, TransactionRequirement } from '../../../shared/types';

export interface TransactionListResult {
  transactions: Transaction[];
  meta?: PaginatedMeta;
}

export interface CreateTransactionPayload {
  customerId: string;
  branchId?: string;
  items: {
    vehicleId: string;
    serviceTypeId: string;
    baseCost?: number;
    vehicleTypeCode?: string;
    provinceCode?: string;
    cityCode?: string;
    feeDetails?: { componentCode: string; amount: number }[];
  }[];
  dpAmount?: number;
  estimatedFinishDate?: string;
  notes?: string;
}

export interface UpdateDocumentChecklistPayload {
  isChecked: boolean;
  notes?: string;
}

/** API contract: POST /transactions/:id/finalize only accepts finalTotal + optional notes */
export interface FinalizePayload {
  finalTotal: number;
  notes?: string;
}

export const transactionService = {
  list: async (params?: {
    search?: string;
    status?: TransactionStatus;
    branchId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
    sort?: string;
  }): Promise<TransactionListResult> => {
    const { startDate, endDate, ...rest } = params || {};
    const queryParams = {
      ...rest,
      start_date: startDate,
      end_date: endDate,
    };
    const { data } = await apiClient.get<ApiResponse<Transaction[]>>('/transactions', { params: queryParams });
    return { transactions: data.data || [], meta: data.meta };
  },

  getById: async (id: string): Promise<Transaction> => {
    const { data } = await apiClient.get<ApiResponse<Transaction>>(`/transactions/${id}`);
    return data.data;
  },

  getRequirements: async (params: {
    serviceTypeId?: string;
    vehicleTypeCode?: string;
    provinceCode?: string;
    cityCode?: string;
  }): Promise<TransactionRequirement> => {
    const { data } = await apiClient.get<ApiResponse<TransactionRequirement>>('/transactions/requirements', { params });
    return data.data;
  },

  create: async (payload: CreateTransactionPayload): Promise<Transaction> => {
    const { data } = await apiClient.post<ApiResponse<Transaction>>('/transactions', payload);
    return data.data;
  },

  updateStatus: async (id: string, status: TransactionStatus, notes?: string): Promise<Transaction> => {
    const { data } = await apiClient.patch<ApiResponse<Transaction>>(`/transactions/${id}/status`, { status, notes });
    return data.data;
  },

  updateDocumentChecklist: async (transactionId: string, checklistId: string, payload: UpdateDocumentChecklistPayload): Promise<Transaction> => {
    const { data } = await apiClient.patch<ApiResponse<Transaction>>(`/transactions/${transactionId}/document-checklist/${checklistId}`, payload);
    return data.data;
  },

  finalize: async (id: string, payload: FinalizePayload): Promise<Transaction> => {
    // API only accepts { finalTotal, notes } — extra fields are ignored but we send only what's specified
    const { data } = await apiClient.post<ApiResponse<Transaction>>(`/transactions/${id}/finalize`, {
      finalTotal: payload.finalTotal,
      notes: payload.notes,
    });
    return data.data;
  },

  close: async (id: string): Promise<Transaction> => {
    const { data } = await apiClient.post<ApiResponse<Transaction>>(`/transactions/${id}/close`);
    return data.data;
  },

  getInvoiceUrl: (id: string): string => `/transactions/${id}/invoice`,

  getPayments: async (id: string): Promise<Payment[]> => {
    const { data } = await apiClient.get<ApiResponse<Payment[]>>(`/transactions/${id}/payments`);
    return data.data || [];
  },

  addPayment: async (id: string, payload: { type: string; method: string; amount: number; notes?: string }): Promise<Payment> => {
    const { data } = await apiClient.post<ApiResponse<Payment>>(`/transactions/${id}/payments`, payload);
    return data.data;
  },
};