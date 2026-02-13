export type ScriptFormat = 'phone' | 'email' | 'chat';

export interface ScriptSection {
  title: string;
  content: string;
}

export interface NegotiationScript {
  billId: string;
  format: ScriptFormat;
  sections: ScriptSection[];
  keyPoints: string[];
  createdAt: string;
}
