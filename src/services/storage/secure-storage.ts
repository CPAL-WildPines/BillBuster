import * as SecureStore from 'expo-secure-store';

const KEYS = {
  OPENAI_API_KEY: 'billbuster_openai_key',
  ANTHROPIC_API_KEY: 'billbuster_anthropic_key',
  OPENROUTER_API_KEY: 'billbuster_openrouter_key',
} as const;

export async function getOpenAIKey(): Promise<string | null> {
  return SecureStore.getItemAsync(KEYS.OPENAI_API_KEY);
}

export async function setOpenAIKey(key: string): Promise<void> {
  await SecureStore.setItemAsync(KEYS.OPENAI_API_KEY, key);
}

export async function getAnthropicKey(): Promise<string | null> {
  return SecureStore.getItemAsync(KEYS.ANTHROPIC_API_KEY);
}

export async function setAnthropicKey(key: string): Promise<void> {
  await SecureStore.setItemAsync(KEYS.ANTHROPIC_API_KEY, key);
}

export async function getOpenRouterKey(): Promise<string | null> {
  return SecureStore.getItemAsync(KEYS.OPENROUTER_API_KEY);
}

export async function setOpenRouterKey(key: string): Promise<void> {
  await SecureStore.setItemAsync(KEYS.OPENROUTER_API_KEY, key);
}

export async function deleteAllKeys(): Promise<void> {
  await SecureStore.deleteItemAsync(KEYS.OPENAI_API_KEY);
  await SecureStore.deleteItemAsync(KEYS.ANTHROPIC_API_KEY);
  await SecureStore.deleteItemAsync(KEYS.OPENROUTER_API_KEY);
}
