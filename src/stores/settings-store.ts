import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AIProviderType, AppSettings } from '@/src/models/settings';
import { DEFAULT_SETTINGS } from '@/src/models/settings';

interface SettingsState extends AppSettings {
  setAIProvider: (provider: AIProviderType) => void;
  incrementScansUsed: () => void;
  resetScansUsed: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,

      setAIProvider: (aiProvider) => set({ aiProvider }),
      incrementScansUsed: () => set((s) => ({ scansUsed: s.scansUsed + 1 })),
      resetScansUsed: () => set({ scansUsed: 0 }),
    }),
    {
      name: 'billbuster-settings',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
