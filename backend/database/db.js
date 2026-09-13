import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import '../config/env.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultDatabasePath = path.join(__dirname, 'data', 'support-crm.db');
const databasePath = process.env.SQLITE_DB_PATH
  ? (path.isAbsolute(process.env.SQLITE_DB_PATH)
    ? process.env.SQLITE_DB_PATH
    : path.resolve(__dirname, '..', process.env.SQLITE_DB_PATH))
  : defaultDatabasePath;
fs.mkdirSync(path.dirname(databasePath), { recursive: true });

const db = new DatabaseSync(databasePath);
db.exec('PRAGMA foreign_keys = ON');
db.exec('PRAGMA journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Open' CHECK(status IN ('Open', 'In Progress', 'Closed')),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id TEXT NOT NULL,
    note_text TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY(ticket_id) REFERENCES tickets(ticket_id) ON DELETE CASCADE
  );
`);

export default db;

export function transaction(callback) {
  db.exec('BEGIN');
  try {
    const result = callback();
    db.exec('COMMIT');
    return result;
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}
