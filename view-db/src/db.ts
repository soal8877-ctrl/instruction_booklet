import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { Pool } from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.join(__dirname, "../../.env") });

export type DbKey = "local" | "work";

const pools = new Map<DbKey, Pool>();

function parseHost(connectionString: string | undefined): string | null {
  if (!connectionString) return null;
  try {
    const url = new URL(connectionString.replace(/^postgresql:/, "http:"));
    return url.hostname;
  } catch {
    return null;
  }
}

export function getDbConfig() {
  const workUrl = process.env.DATABASE_URL;
  const localUrl = process.env.LOCAL_DATABASE_URL;

  return {
    work: {
      configured: Boolean(workUrl),
      host: parseHost(workUrl),
      label: "Рабочая БД",
    },
    local: {
      configured: Boolean(localUrl),
      host: parseHost(localUrl),
      label: "Локальная БД",
    },
  };
}

export function getPool(dbKey: DbKey): Pool {
  const url =
    dbKey === "local" ? process.env.LOCAL_DATABASE_URL : process.env.DATABASE_URL;

  if (!url) {
    const name = dbKey === "local" ? "LOCAL_DATABASE_URL" : "DATABASE_URL";
    throw new Error(`Переменная ${name} не задана в .env`);
  }

  let pool = pools.get(dbKey);
  if (!pool) {
    pool = new Pool({ connectionString: url });
    pools.set(dbKey, pool);
  }
  return pool;
}

export function assertDbKey(value: string): DbKey {
  if (value === "local" || value === "work") return value;
  throw new Error("Недопустимый ключ БД");
}

export function assertTableName(name: string): string {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) {
    throw new Error("Недопустимое имя таблицы");
  }
  return name;
}

export function quoteIdent(name: string): string {
  assertTableName(name);
  return `"${name.replace(/"/g, '""')}"`;
}
