import AsyncStorage from '@react-native-async-storage/async-storage';
import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';

import type {
  Budget,
  Transaction,
  TransactionType,
} from '../../../src/models/finance';
import type { FinanceRepository } from '../../../src/repositories/finance-repository';

export const SQLITE_DB = 'so-chi-tieu.db';
const LEGACY_KEY = 'so-chi-tieu.finance.v1';
const BACKUP_KEY = `${LEGACY_KEY}.backup`;
const MIGRATION_KEY = 'so-chi-tieu.sqlite.migration.v1';

type StoredData = {
  transactions?: unknown;
  budgets?: Record<string, unknown>;
};

type TransactionRow = {
  id: string;
  amount: number;
  type: TransactionType;
  category: string;
  note: string;
  date: string;
  created_at: string;
};

type BudgetRow = {
  month: string;
  amount: number;
};

function isTransaction(value: unknown): value is Transaction {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<Transaction>;
  return (
    typeof item.id === 'string' &&
    typeof item.amount === 'number' &&
    Number.isFinite(item.amount) &&
    (item.type === 'income' || item.type === 'expense') &&
    typeof item.category === 'string' &&
    typeof item.note === 'string' &&
    typeof item.date === 'string' &&
    typeof item.createdAt === 'string'
  );
}

function parseLegacyData(raw: string | null): {
  transactions: Transaction[];
  budgets: Record<string, number>;
} {
  if (!raw) return { transactions: [], budgets: {} };

  try {
    const parsed: unknown = JSON.parse(raw);
    const data: StoredData = Array.isArray(parsed)
      ? { transactions: parsed }
      : parsed && typeof parsed === 'object'
        ? (parsed as StoredData)
        : {};
    const transactions = Array.isArray(data.transactions)
      ? data.transactions.filter(isTransaction)
      : [];
    const budgets = Object.fromEntries(
      Object.entries(data.budgets ?? {}).filter(
        ([month, amount]) =>
          /^\d{4}-\d{2}$/.test(month) &&
          typeof amount === 'number' &&
          Number.isFinite(amount) &&
          amount >= 0,
      ),
    ) as Record<string, number>;
    return { transactions, budgets };
  } catch {
    return { transactions: [], budgets: {} };
  }
}

function toTransaction(row: TransactionRow): Transaction {
  return {
    id: row.id,
    amount: Number(row.amount),
    type: row.type,
    category: row.category,
    note: row.note,
    date: row.date,
    createdAt: row.created_at,
  };
}

export class SqliteFinanceRepository implements FinanceRepository {
  private databasePromise: Promise<SQLiteDatabase> | null = null;
  private initialized = false;

  private database(): Promise<SQLiteDatabase> {
    if (!this.databasePromise) {
      this.databasePromise = openDatabaseAsync(SQLITE_DB);
    }
    return this.databasePromise;
  }

  async init(): Promise<void> {
    if (this.initialized) return;

    const db = await this.database();
    await db.execAsync(`
      PRAGMA foreign_keys = ON;
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY NOT NULL,
        amount REAL NOT NULL CHECK (amount > 0),
        type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
        category TEXT NOT NULL,
        note TEXT NOT NULL DEFAULT '',
        date TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS budgets (
        month TEXT PRIMARY KEY NOT NULL,
        amount REAL NOT NULL CHECK (amount >= 0)
      );
    `);

    const migration = await AsyncStorage.getItem(MIGRATION_KEY);
    if (!migration) {
      await this.migrateLegacyData(db);
      await AsyncStorage.setItem(MIGRATION_KEY, '1');
    }
    this.initialized = true;
  }

  private async migrateLegacyData(db: SQLiteDatabase): Promise<void> {
    const raw = await AsyncStorage.getItem(LEGACY_KEY);
    if (!raw) return;

    const data = parseLegacyData(raw);
    await AsyncStorage.setItem(BACKUP_KEY, raw);
    await db.withTransactionAsync(async () => {
      for (const item of data.transactions) {
        await db.runAsync(
          `INSERT OR REPLACE INTO transactions
            (id, amount, type, category, note, date, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          item.id,
          item.amount,
          item.type,
          item.category,
          item.note,
          item.date,
          item.createdAt,
        );
      }
      for (const [month, amount] of Object.entries(data.budgets)) {
        await db.runAsync(
          'INSERT OR REPLACE INTO budgets (month, amount) VALUES (?, ?)',
          month,
          amount,
        );
      }
    });
  }

  async list(): Promise<Transaction[]> {
    await this.init();
    const db = await this.database();
    const rows = await db.getAllAsync<TransactionRow>(
      'SELECT id, amount, type, category, note, date, created_at FROM transactions ORDER BY date DESC, created_at DESC',
    );
    return rows.map(toTransaction);
  }

  async save(item: Transaction): Promise<void> {
    await this.init();
    const db = await this.database();
    await db.runAsync(
      `INSERT OR REPLACE INTO transactions
        (id, amount, type, category, note, date, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      item.id,
      item.amount,
      item.type,
      item.category,
      item.note,
      item.date,
      item.createdAt,
    );
  }

  async remove(id: string): Promise<void> {
    await this.init();
    const db = await this.database();
    await db.runAsync('DELETE FROM transactions WHERE id = ?', id);
  }

  async replace(items: Transaction[]): Promise<void> {
    await this.init();
    const current = await this.list();
    await AsyncStorage.setItem(
      BACKUP_KEY,
      JSON.stringify({ transactions: current, budgets: {} }),
    );
    const db = await this.database();
    await db.withTransactionAsync(async () => {
      await db.runAsync('DELETE FROM transactions');
      for (const item of items) {
        await db.runAsync(
          `INSERT INTO transactions
            (id, amount, type, category, note, date, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          item.id,
          item.amount,
          item.type,
          item.category,
          item.note,
          item.date,
          item.createdAt,
        );
      }
    });
  }

  async getBudget(month: string): Promise<number> {
    await this.init();
    const db = await this.database();
    const row = await db.getFirstAsync<BudgetRow>(
      'SELECT month, amount FROM budgets WHERE month = ?',
      month,
    );
    return row ? Number(row.amount) : 0;
  }

  async setBudget(month: string, amount: number): Promise<void> {
    await this.init();
    const db = await this.database();
    await db.runAsync(
      'INSERT OR REPLACE INTO budgets (month, amount) VALUES (?, ?)',
      month,
      amount,
    );
  }

  async cleanup(): Promise<void> {
    await this.init();
    const transactions = await this.list();
    const db = await this.database();
    const rows = await db.getAllAsync<BudgetRow>('SELECT month, amount FROM budgets');
    const budgets = Object.fromEntries(rows.map((row) => [row.month, Number(row.amount)]));
    await AsyncStorage.setItem(
      BACKUP_KEY,
      JSON.stringify({ transactions, budgets }),
    );
  }
}
