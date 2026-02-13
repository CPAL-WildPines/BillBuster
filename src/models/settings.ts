export type AIProviderType = 'openrouter' | 'openai' | 'anthropic';

export interface AppSettings {
  aiProvider: AIProviderType;
  isPro: boolean;
  scansUsed: number;
  maxFreeScans: number;
}

export const DEFAULT_SETTINGS: AppSettings = {
  aiProvider: 'openrouter',
  isPro: true, // Hardcoded pro for MVP
  scansUsed: 0,
  maxFreeScans: 3,
};
