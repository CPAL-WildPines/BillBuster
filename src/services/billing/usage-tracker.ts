import { DEFAULT_SETTINGS } from '@/src/models/settings';

export function canScan(scansUsed: number, isPro: boolean): boolean {
  if (isPro) return true;
  return scansUsed < DEFAULT_SETTINGS.maxFreeScans;
}

export function getRemainingScans(scansUsed: number, isPro: boolean): number | null {
  if (isPro) return null; // unlimited
  return Math.max(0, DEFAULT_SETTINGS.maxFreeScans - scansUsed);
}
