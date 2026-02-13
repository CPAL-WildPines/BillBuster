export async function testOpenRouterKey(apiKey: string): Promise<{ ok: boolean; message: string }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (response.ok) return { ok: true, message: 'Key is valid' };
    return { ok: false, message: `Error ${response.status}` };
  } catch (err: any) {
    if (err.name === 'AbortError') return { ok: false, message: 'Timed out' };
    return { ok: false, message: 'Connection failed' };
  }
}

export async function testOpenAIKey(apiKey: string): Promise<{ ok: boolean; message: string }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (response.ok) return { ok: true, message: 'Key is valid' };
    return { ok: false, message: `Error ${response.status}` };
  } catch (err: any) {
    if (err.name === 'AbortError') return { ok: false, message: 'Timed out' };
    return { ok: false, message: 'Connection failed' };
  }
}

export async function testAnthropicKey(apiKey: string): Promise<{ ok: boolean; message: string }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 1,
        messages: [{ role: 'user', content: 'hi' }],
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (response.ok) return { ok: true, message: 'Key is valid' };
    const data = await response.json().catch(() => null);
    if (response.status === 401) return { ok: false, message: 'Invalid key' };
    return { ok: false, message: `Error ${response.status}` };
  } catch (err: any) {
    if (err.name === 'AbortError') return { ok: false, message: 'Timed out' };
    return { ok: false, message: 'Connection failed' };
  }
}
