import type { AIProvider } from './types';
import type { AIProviderType } from '@/src/models/settings';
import { OpenAIProvider } from './openai-provider';
import { AnthropicProvider } from './anthropic-provider';
import { OpenRouterProvider } from './openrouter-provider';

const providers: Record<AIProviderType, () => AIProvider> = {
  openrouter: () => new OpenRouterProvider(),
  openai: () => new OpenAIProvider(),
  anthropic: () => new AnthropicProvider(),
};

export function getAIProvider(type: AIProviderType): AIProvider {
  return providers[type]();
}
