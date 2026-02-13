import { create } from 'zustand';
import type { Bill } from '@/src/models/bill';
import type { AnalysisResult } from '@/src/models/analysis';
import type { NegotiationScript } from '@/src/models/negotiation';

type ScanStatus = 'idle' | 'reviewing' | 'analyzing' | 'done' | 'error';

interface BillState {
  status: ScanStatus;
  imageUri: string | null;
  currentBill: Bill | null;
  currentAnalysis: AnalysisResult | null;
  currentScript: NegotiationScript | null;
  error: string | null;

  setImageUri: (uri: string) => void;
  setStatus: (status: ScanStatus) => void;
  setCurrentBill: (bill: Bill) => void;
  setCurrentAnalysis: (analysis: AnalysisResult) => void;
  setCurrentScript: (script: NegotiationScript) => void;
  setError: (error: string) => void;
  reset: () => void;
}

const initialState = {
  status: 'idle' as ScanStatus,
  imageUri: null,
  currentBill: null,
  currentAnalysis: null,
  currentScript: null,
  error: null,
};

export const useBillStore = create<BillState>((set) => ({
  ...initialState,

  setImageUri: (uri) => set({ imageUri: uri, status: 'reviewing' }),
  setStatus: (status) => set({ status }),
  setCurrentBill: (bill) => set({ currentBill: bill }),
  setCurrentAnalysis: (analysis) => set({ currentAnalysis: analysis, status: 'done' }),
  setCurrentScript: (script) => set({ currentScript: script }),
  setError: (error) => set({ error, status: 'error' }),
  reset: () => set(initialState),
}));
