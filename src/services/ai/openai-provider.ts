import type { AIProvider, BillAnalysisResponse, ScriptGenerationResponse } from './types';
import type { Finding } from '@/src/models/analysis';
import { BILL_ANALYSIS_PROMPT, NEGOTIATION_SCRIPT_PROMPT } from './prompts';
import { getOpenAIKey } from '@/src/services/storage/secure-storage';

export class OpenAIProvider implements AIProvider {
  name = 'OpenAI GPT-4o';

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
    const apiKey = await getOpenAIKey();
    if (!apiKey) throw new Error('OpenAI API key not configured. Go to Settings to add it.');

    const response = await this.fetchWithTimeout('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        response_format: { type: 'json_object' },
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: BILL_ANALYSIS_PROMPT },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`,
                  detail: 'high',
                },
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error (${response.status}): ${error}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    if (!content) throw new Error('No response from OpenAI');

    return JSON.parse(content) as BillAnalysisResponse;
  }

  async generateScript(
    provider: string,
    findings: Finding[],
    totalSavings: number,
  ): Promise<ScriptGenerationResponse> {
    const apiKey = await getOpenAIKey();
    if (!apiKey) throw new Error('OpenAI API key not configured.');

    const prompt = NEGOTIATION_SCRIPT_PROMPT
      .replace('{provider}', provider)
      .replace('{findings}', JSON.stringify(findings, null, 2))
      .replace('{totalSavings}', `$${(totalSavings / 100).toFixed(2)}`);

    const response = await this.fetchWithTimeout('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        response_format: { type: 'json_object' },
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error (${response.status}): ${error}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    if (!content) throw new Error('No response from OpenAI');

    return JSON.parse(content) as ScriptGenerationResponse;
  }
}
