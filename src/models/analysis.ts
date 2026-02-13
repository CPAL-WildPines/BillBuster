export type FindingType = 'overcharge' | 'hidden_fee' | 'error' | 'rate_increase' | 'unnecessary_service' | 'optimization';
export type FindingSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface Finding {
  type: FindingType;
  severity: FindingSeverity;
  title: string;
  description: string;
  /** Estimated savings in cents */
  estimatedSavings: number;
  /** 0-1 confidence score */
  confidence: number;
}

export interface AnalysisResult {
  billId: string;
  summary: string;
  /** 0-100 risk score */
  overallRiskScore: number;
  /** Total identified savings in cents */
  totalIdentifiedSavings: number;
  findings: Finding[];
  createdAt: string;
}
