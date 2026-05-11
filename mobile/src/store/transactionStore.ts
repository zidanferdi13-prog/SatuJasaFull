import { create } from 'zustand';
import { Transaction, Service } from '../types';

interface TransactionStore {
  transactions: Transaction[];
  services: Service[];
  selectedService: Service | null;
  dailyRevenue: number;
  pendingCount: number;
  isLoading: boolean;

  setTransactions: (transactions: Transaction[]) => void;
  addTransaction: (transaction: Transaction) => void;
  setServices: (services: Service[]) => void;
  setSelectedService: (service: Service | null) => void;
  setDailyRevenue: (amount: number) => void;
  setPendingCount: (count: number) => void;
  setLoading: (loading: boolean) => void;
}

export const useTransactionStore = create<TransactionStore>((set) => ({
  transactions: [],
  services: [],
  selectedService: null,
  dailyRevenue: 0,
  pendingCount: 0,
  isLoading: false,

  setTransactions: (transactions) => set({ transactions }),
  addTransaction: (transaction) =>
    set((state) => ({
      transactions: [transaction, ...state.transactions],
    })),
  setServices: (services) => set({ services }),
  setSelectedService: (service) => set({ selectedService: service }),
  setDailyRevenue: (amount) => set({ dailyRevenue: amount }),
  setPendingCount: (count) => set({ pendingCount: count }),
  setLoading: (loading) => set({ isLoading: loading }),
}));
