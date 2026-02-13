import type { AIProvider, BillAnalysisResponse, ScriptGenerationResponse } from './types';
import type { Finding } from '@/src/models/analysis';
import { BILL_ANALYSIS_PROMPT, NEGOTIATION_SCRIPT_PROMPT } from './prompts';
import { getOpenRouterKey } from '@/src/services/storage/secure-storage';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const VISION_MODEL = 'openai/gpt-4o';
const TEXT_MODEL = 'openai/gpt-4o';

export class OpenRouterProvider implements AIProvider {
  name = 'OpenRouter';

  private async callAPI(body: object): Promise<any> {
    const apiKey = await getOpenRouterKey();
    if (!apiKey) throw new Error('OpenRouter API key not configured. Go to Settings to add it.');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);

    let response: Response;
    try {
      response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://billbuster.app',
          'X-Title': 'BillBuster',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
    } catch (err: any) {
      if (err.name === 'AbortError') throw new Error('Request timed out. Please try again.');
      throw err;
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter API error (${response.status}): ${error}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error('No response from OpenRouter');

    return content;
  }

  async analyzeBill(imageBase64: string): Promise<BillAnalysisResponse> {
    const content = await this.callAPI({
      model: VISION_MODEL,
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
    });

    // Extract JSON from the response (handle markdown code fences)
    const jsonStr = extractJSON(content);
    return JSON.parse(jsonStr) as BillAnalysisResponse;
  }

  async generateScript(
    provider: string,
    findings: Finding[],
    totalSavings: number,
  ): Promise<ScriptGenerationResponse> {
    const prompt = NEGOTIATION_SCRIPT_PROMPT
      .replace('{provider}', provider)
      .replace('{findings}', JSON.stringify(findings, null, 2))
      .replace('{totalSavings}', `$${(totalSavings / 100).toFixed(2)}`);

    const content = await this.callAPI({
      model: TEXT_MODEL,
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    });

    const jsonStr = extractJSON(content);
    return JSON.parse(jsonStr) as ScriptGenerationResponse;
  }
}

function extractJSON(text: string): string {
  // Try to extract from markdown code fence first
  const fenceMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (fenceMatch) return fenceMatch[1].trim();

  // Otherwise try to find raw JSON object
  const braceMatch = text.match(/\{[\s\S]*\}/);
  if (braceMatch) return braceMatch[0];

  return text;
}
