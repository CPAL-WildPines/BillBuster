import { getDatabase } from './database';
import type { Bill } from '@/src/models/bill';
import type { AnalysisResult } from '@/src/models/analysis';
import type { NegotiationScript } from '@/src/models/negotiation';

function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch (error) {
    console.error('Failed to parse JSON:', error);
    return fallback;
  }
}

// --- Bills ---

export async function saveBill(bill: Bill): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT OR REPLACE INTO bills (id, imageUri, category, provider, totalAmount, billDate, createdAt, lineItems)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    bill.id,
    bill.imageUri,
    bill.category,
    bill.provider,
    bill.totalAmount,
    bill.billDate,
    bill.createdAt,
    JSON.stringify(bill.lineItems),
  );
}

export async function getBill(id: string): Promise<Bill | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<any>(
    'SELECT * FROM bills WHERE id = ?',
    id,
  );
  if (!row) return null;
  return {
    ...row,
    lineItems: safeJsonParse(row.lineItems, []),
  };
}

export async function getAllBills(): Promise<Bill[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<any>(
    'SELECT * FROM bills ORDER BY createdAt DESC',
  );
  return rows.map((row) => ({
    ...row,
    lineItems: safeJsonParse(row.lineItems, []),
  }));
}

export async function deleteBill(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM scripts WHERE billId = ?', id);
  await db.runAsync('DELETE FROM analyses WHERE billId = ?', id);
  await db.runAsync('DELETE FROM bills WHERE id = ?', id);
}

// --- Analyses ---

export async function saveAnalysis(analysis: AnalysisResult): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT OR REPLACE INTO analyses (billId, summary, overallRiskScore, totalIdentifiedSavings, findings, createdAt)
     VALUES (?, ?, ?, ?, ?, ?)`,
    analysis.billId,
    analysis.summary,
    analysis.overallRiskScore,
    analysis.totalIdentifiedSavings,
    JSON.stringify(analysis.findings),
    analysis.createdAt,
  );
}

export async function getAnalysis(billId: string): Promise<AnalysisResult | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<any>(
    'SELECT * FROM analyses WHERE billId = ?',
    billId,
  );
  if (!row) return null;
  return {
    ...row,
    findings: safeJsonParse(row.findings, []),
  };
}

// --- Scripts ---

export async function saveScript(script: NegotiationScript): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT OR REPLACE INTO scripts (billId, format, sections, keyPoints, createdAt)
     VALUES (?, ?, ?, ?, ?)`,
    script.billId,
    script.format,
    JSON.stringify(script.sections),
    JSON.stringify(script.keyPoints),
    script.createdAt,
  );
}

export async function getScript(billId: string): Promise<NegotiationScript | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<any>(
    'SELECT * FROM scripts WHERE billId = ?',
    billId,
  );
  if (!row) return null;
  return {
    ...row,
    sections: safeJsonParse(row.sections, []),
    keyPoints: safeJsonParse(row.keyPoints, []),
  };
}

// --- Aggregates ---

export async function getTotalSavings(): Promise<number> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ total: number | null }>(
    'SELECT SUM(totalIdentifiedSavings) as total FROM analyses',
  );
  return row?.total ?? 0;
}

export async function getBillCount(): Promise<number> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM bills',
  );
  return row?.count ?? 0;
}
