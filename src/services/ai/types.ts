import type { LineItem, BillCategory } from '@/src/models/bill';
import type { Finding } from '@/src/models/analysis';
import type { ScriptSection } from '@/src/models/negotiation';

export interface BillAnalysisResponse {
  provider: string;
  category: BillCategory;
  totalAmount: number;
  billDate: string;
  lineItems: LineItem[];
  findings: Finding[];
  summary: string;
  overallRiskScore: number;
  totalIdentifiedSavings: number;
}

export interface ScriptGenerationResponse {
  sections: ScriptSection[];
  keyPoints: string[];
}

export interface AIProvider {
  name: string;
  analyzeBill(imageBase64: string): Promise<BillAnalysisResponse>;
  generateScript(
    provider: string,
    findings: Finding[],
    totalSavings: number,
  ): Promise<ScriptGenerationResponse>;
}
