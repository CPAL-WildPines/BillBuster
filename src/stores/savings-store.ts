import { create } from 'zustand';
import * as repo from '@/src/services/storage/bill-repository';

interface SavingsState {
  totalSavings: number;
  billCount: number;
  loading: boolean;

  loadSavings: () => Promise<void>;
  addSavings: (amount: number) => void;
}

export const useSavingsStore = create<SavingsState>((set) => ({
  totalSavings: 0,
  billCount: 0,
  loading: false,

  loadSavings: async () => {
    set({ loading: true });
    const [totalSavings, billCount] = await Promise.all([
      repo.getTotalSavings(),
      repo.getBillCount(),
    ]);
    set({ totalSavings, billCount, loading: false });
  },

  addSavings: (amount) =>
    set((state) => ({
      totalSavings: state.totalSavings + amount,
      billCount: state.billCount + 1,
    })),
}));
