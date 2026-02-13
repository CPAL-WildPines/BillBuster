import type { AIProvider, BillAnalysisResponse, ScriptGenerationResponse } from './types';
import type { Finding } from '@/src/models/analysis';
import { BILL_ANALYSIS_PROMPT, NEGOTIATION_SCRIPT_PROMPT } from './prompts';
import { getAnthropicKey } from '@/src/services/storage/secure-storage';

function extractJSON(text: string): string {
  // Try code fence first
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) return fenceMatch[1].trim();

  // Try to find raw JSON object
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) return jsonMatch[0];

  throw new Error('Could not extract JSON from Anthropic response');
}

export class AnthropicProvider implements AIProvider {
  name = 'Anthropic Claude';

  private async fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);
    try {
      const response = await fetch(url, { ...init, signal: controller.signal });
      return response;
    } catch (err: any) {
      if (err.name === 'AbortError') throw new Error('Request timed out. Please try again.');
      throw err;
    } finally {
      clearTimeout(timeout);
    }
  }

  async analyzeBill(imageBase64: string): Promise<BillAnalysisResponse> {
    const apiKey = await getAnthropicKey();
    if (!apiKey) throw new Error('Anthropic API key not configured. Go to Settings to add it.');

    const response = await this.fetchWithTimeout('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/jpeg',
                  data: imageBase64,
                },
              },
              {
                type: 'text',
                text: BILL_ANALYSIS_PROMPT + '\n\nRespond with only the JSON object, no other text.',
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API error (${response.status}): ${error}`);
    }

    const data = await response.json();
    const content = data.content?.[0]?.text;
    if (!content) throw new Error('No response from Anthropic');

    return JSON.parse(extractJSON(content)) as BillAnalysisResponse;
  }

  async generateScript(
    provider: string,
    findings: Finding[],
    totalSavings: number,
  ): Promise<ScriptGenerationResponse> {
    const apiKey = await getAnthropicKey();
    if (!apiKey) throw new Error('Anthropic API key not configured.');

    const prompt = NEGOTIATION_SCRIPT_PROMPT
      .replace('{provider}', provider)
      .replace('{findings}', JSON.stringify(findings, null, 2))
      .replace('{totalSavings}', `$${(totalSavings / 100).toFixed(2)}`);

    const response = await this.fetchWithTimeout('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: prompt + '\n\nRespond with only the JSON object, no other text.',
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API error (${response.status}): ${error}`);
    }

    const data = await response.json();
    const content = data.content?.[0]?.text;
    if (!content) throw new Error('No response from Anthropic');

    return JSON.parse(extractJSON(content)) as ScriptGenerationResponse;
  }
}
