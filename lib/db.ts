import "server-only";
import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import path from "node:path";

export type Subscriber = {
  id: number;
  email: string;
  created_at: string;
  ip: string | null;
  user_agent: string | null;
  notified: number;
};

let db: DatabaseSync | null = null;

function getDb(): DatabaseSync {
  if (db) return db;
  const dir = path.resolve(process.env.DATA_DIR || "./data");
  mkdirSync(dir, { recursive: true });
  db = new DatabaseSync(path.join(dir, "subscribers.db"));
  db.exec(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS subscribers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
      ip TEXT,
      user_agent TEXT,
      notified INTEGER NOT NULL DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS idx_subscribers_created_at ON subscribers(created_at);
  `);
  return db;
}

export type InsertResult = { status: "created"; id: number } | { status: "exists" };

export function insertSubscriber(
  email: string,
  meta: { ip?: string | null; userAgent?: string | null },
): InsertResult {
  const d = getDb();
  const stmt = d.prepare(
    "INSERT OR IGNORE INTO subscribers (email, ip, user_agent) VALUES (?, ?, ?)",
  );
  const res = stmt.run(email, meta.ip ?? null, meta.userAgent ?? null);
  if (res.changes === 0) return { status: "exists" };
  return { status: "created", id: Number(res.lastInsertRowid) };
}

export function markNotified(id: number): void {
  getDb().prepare("UPDATE subscribers SET notified = 1 WHERE id = ?").run(id);
}

export function listSubscribers(): Subscriber[] {
  return getDb()
    .prepare("SELECT * FROM subscribers ORDER BY created_at DESC, id DESC")
    .all() as Subscriber[];
}

export function deleteSubscriber(id: number): void {
  getDb().prepare("DELETE FROM subscribers WHERE id = ?").run(id);
}

export type Stats = {
  total: number;
  today: number;
  last7: number;
  perDay: { day: string; count: number }[];
};

export function getStats(): Stats {
  const d = getDb();
  const total = (d.prepare("SELECT COUNT(*) AS c FROM subscribers").get() as { c: number }).c;
  const today = (
    d
      .prepare("SELECT COUNT(*) AS c FROM subscribers WHERE date(created_at) = date('now')")
      .get() as { c: number }
  ).c;
  const last7 = (
    d
      .prepare(
        "SELECT COUNT(*) AS c FROM subscribers WHERE created_at >= datetime('now', '-7 days')",
      )
      .get() as { c: number }
  ).c;
  const rows = d
    .prepare(
      `SELECT date(created_at) AS day, COUNT(*) AS count
       FROM subscribers
       WHERE created_at >= datetime('now', '-13 days')
       GROUP BY day`,
    )
    .all() as { day: string; count: number }[];
  const byDay = new Map(rows.map((r) => [r.day, r.count]));
  const perDay: Stats["perDay"] = [];
  for (let i = 13; i >= 0; i--) {
    const dt = new Date();
    dt.setUTCDate(dt.getUTCDate() - i);
    const key = dt.toISOString().slice(0, 10);
    perDay.push({ day: key, count: byDay.get(key) ?? 0 });
  }
  return { total, today, last7, perDay };
}
