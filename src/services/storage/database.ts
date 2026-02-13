import * as SQLite from 'expo-sqlite';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = initDB();
  }
  return dbPromise;
}

async function initDB(): Promise<SQLite.SQLiteDatabase> {
  try {
    const db = await SQLite.openDatabaseAsync('billbuster.db');
    await initializeSchema(db);
    return db;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    dbPromise = null; // Reset so next call retries
    throw error;
  }
}

async function initializeSchema(database: SQLite.SQLiteDatabase): Promise<void> {
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS bills (
      id TEXT PRIMARY KEY NOT NULL,
      imageUri TEXT NOT NULL,
      category TEXT NOT NULL,
      provider TEXT NOT NULL,
      totalAmount INTEGER NOT NULL,
      billDate TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      lineItems TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS analyses (
      billId TEXT PRIMARY KEY NOT NULL,
      summary TEXT NOT NULL,
      overallRiskScore INTEGER NOT NULL,
      totalIdentifiedSavings INTEGER NOT NULL,
      findings TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (billId) REFERENCES bills(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS scripts (
      billId TEXT PRIMARY KEY NOT NULL,
      format TEXT NOT NULL,
      sections TEXT NOT NULL,
      keyPoints TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (billId) REFERENCES bills(id) ON DELETE CASCADE
    );
  `);
}

export async function deleteAllData(): Promise<void> {
  const database = await getDatabase();
  await database.execAsync(`
    DELETE FROM scripts;
    DELETE FROM analyses;
    DELETE FROM bills;
  `);
}
