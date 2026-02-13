import { create } from 'zustand';
import type { Bill } from '@/src/models/bill';
import type { AnalysisResult } from '@/src/models/analysis';
import * as repo from '@/src/services/storage/bill-repository';

interface HistoryState {
  bills: Bill[];
  loading: boolean;

  loadBills: () => Promise<void>;
  addBill: (bill: Bill, analysis: AnalysisResult) => Promise<void>;
  removeBill: (id: string) => Promise<void>;
  getAnalysis: (billId: string) => Promise<AnalysisResult | null>;
}

export const useHistoryStore = create<HistoryState>((set) => ({
  bills: [],
  loading: false,

  loadBills: async () => {
    set({ loading: true });
    const bills = await repo.getAllBills();
    set({ bills, loading: false });
  },

  addBill: async (bill, analysis) => {
    await repo.saveBill(bill);
    await repo.saveAnalysis(analysis);
    set((state) => ({ bills: [bill, ...state.bills] }));
  },

  removeBill: async (id) => {
    await repo.deleteBill(id);
    set((state) => ({ bills: state.bills.filter((b) => b.id !== id) }));
  },

  getAnalysis: (billId) => repo.getAnalysis(billId),
}));
