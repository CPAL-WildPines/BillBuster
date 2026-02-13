import { useSettingsStore } from '@/src/stores/settings-store';
import { canScan, getRemainingScans } from '@/src/services/billing/usage-tracker';

export function useUsageGate() {
  const scansUsed = useSettingsStore((s) => s.scansUsed);
  const isPro = useSettingsStore((s) => s.isPro);

  return {
    canScan: canScan(scansUsed, isPro),
    remaining: getRemainingScans(scansUsed, isPro),
    isPro,
  };
}
