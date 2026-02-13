export type BillCategory =
  | 'phone'
  | 'internet'
  | 'cable'
  | 'electric'
  | 'gas'
  | 'water'
  | 'insurance'
  | 'medical'
  | 'subscription'
  | 'other';

export interface LineItem {
  description: string;
  /** Amount in cents */
  amount: number;
  flagged: boolean;
  flagReason?: string;
  /** Typical amount in cents for this type of charge */
  typicalAmount?: number;
  /** 0-1 confidence score */
  confidence: number;
}

export interface Bill {
  id: string;
  imageUri: string;
  category: BillCategory;
  provider: string;
  /** Total amount in cents */
  totalAmount: number;
  billDate: string;
  createdAt: string;
  lineItems: LineItem[];
}
