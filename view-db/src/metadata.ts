import type { Pool } from "pg";
import { assertTableName, quoteIdent } from "./db.js";

export type ColumnMeta = {
  name: string;
  dataType: string;
  isNullable: boolean;
  columnDefault: string | null;
};

export async function listTables(pool: Pool): Promise<string[]> {
  const result = await pool.query<{ table_name: string }>(
    `SELECT table_name
     FROM information_schema.tables
     WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
     ORDER BY table_name`,
  );
  return result.rows.map((row) => row.table_name);
}

export async function assertTableExists(pool: Pool, table: string): Promise<void> {
  const tables = await listTables(pool);
  if (!tables.includes(table)) {
    throw new Error(`Таблица не найдена: ${table}`);
  }
}

export async function getTableMeta(pool: Pool, table: string) {
  assertTableName(table);

  const columnsResult = await pool.query<{
    column_name: string;
    data_type: string;
    is_nullable: string;
    column_default: string | null;
  }>(
    `SELECT column_name, data_type, is_nullable, column_default
     FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = $1
     ORDER BY ordinal_position`,
    [table],
  );

  const pkResult = await pool.query<{ column_name: string }>(
    `SELECT kcu.column_name
     FROM information_schema.table_constraints tc
     JOIN information_schema.key_column_usage kcu
       ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
     WHERE tc.table_schema = 'public'
       AND tc.table_name = $1
       AND tc.constraint_type = 'PRIMARY KEY'
     ORDER BY kcu.ordinal_position`,
    [table],
  );

  const columns: ColumnMeta[] = columnsResult.rows.map((row) => ({
    name: row.column_name,
    dataType: row.data_type,
    isNullable: row.is_nullable === "YES",
    columnDefault: row.column_default,
  }));

  const primaryKey = pkResult.rows.map((row) => row.column_name);

  return { table, columns, primaryKey };
}

export async function getRows(
  pool: Pool,
  table: string,
  page: number,
  pageSize: number,
) {
  assertTableName(table);
  const tableSql = quoteIdent(table);
  const offset = (page - 1) * pageSize;

  const countResult = await pool.query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM ${tableSql}`,
  );
  const total = Number(countResult.rows[0]?.count ?? 0);

  const meta = await getTableMeta(pool, table);
  const orderBy =
    meta.primaryKey.length > 0
      ? meta.primaryKey.map((col) => `${quoteIdent(col)} ASC`).join(", ")
      : meta.columns[0]
        ? `${quoteIdent(meta.columns[0].name)} ASC`
        : "1 ASC";

  const rowsResult = await pool.query(
    `SELECT * FROM ${tableSql} ORDER BY ${orderBy} LIMIT $1 OFFSET $2`,
    [pageSize, offset],
  );

  return {
    rows: rowsResult.rows,
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}

function assertColumnName(name: string): string {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) {
    throw new Error(`Недопустимое имя колонки: ${name}`);
  }
  return name;
}

export async function insertRow(pool: Pool, table: string, values: Record<string, unknown>) {
  const meta = await getTableMeta(pool, table);
  const entries = Object.entries(values).filter(([, value]) => value !== "");

  if (entries.length === 0) {
    throw new Error("Нет данных для вставки");
  }

  for (const [key] of entries) {
    if (!meta.columns.some((col) => col.name === key)) {
      throw new Error(`Неизвестная колонка: ${key}`);
    }
    assertColumnName(key);
  }

  const cols = entries.map(([key]) => quoteIdent(key)).join(", ");
  const placeholders = entries.map((_, index) => `$${index + 1}`).join(", ");
  const params = entries.map(([, value]) => (value === null ? null : value));

  const sql = `INSERT INTO ${quoteIdent(table)} (${cols}) VALUES (${placeholders}) RETURNING *`;
  const result = await pool.query(sql, params);
  return result.rows[0];
}

export async function updateRow(
  pool: Pool,
  table: string,
  keys: Record<string, unknown>,
  values: Record<string, unknown>,
) {
  const meta = await getTableMeta(pool, table);
  if (meta.primaryKey.length === 0) {
    throw new Error("Обновление без primary key не поддерживается");
  }

  const valueEntries = Object.entries(values).filter(
    ([key, value]) => value !== "" && !meta.primaryKey.includes(key),
  );
  const keyEntries = Object.entries(keys);

  if (keyEntries.length === 0) {
    throw new Error("Не указан ключ строки");
  }

  for (const key of [...keyEntries, ...valueEntries].map(([name]) => name)) {
    assertColumnName(key);
  }

  const setSql = valueEntries
    .map(([key], index) => `${quoteIdent(key)} = $${index + 1}`)
    .join(", ");
  const whereSql = keyEntries
    .map(([key], index) => `${quoteIdent(key)} = $${valueEntries.length + index + 1}`)
    .join(" AND ");

  const params = [
    ...valueEntries.map(([, value]) => value),
    ...keyEntries.map(([, value]) => value),
  ];

  const sql = `UPDATE ${quoteIdent(table)} SET ${setSql} WHERE ${whereSql} RETURNING *`;
  const result = await pool.query(sql, params);
  if (result.rowCount === 0) {
    throw new Error("Строка не найдена");
  }
  return result.rows[0];
}

export async function deleteRow(pool: Pool, table: string, keys: Record<string, unknown>) {
  const meta = await getTableMeta(pool, table);
  if (meta.primaryKey.length === 0) {
    throw new Error("Удаление без primary key не поддерживается");
  }

  const keyEntries = Object.entries(keys);
  if (keyEntries.length === 0) {
    throw new Error("Не указан ключ строки");
  }

  for (const [key] of keyEntries) {
    assertColumnName(key);
  }

  const whereSql = keyEntries
    .map(([key], index) => `${quoteIdent(key)} = $${index + 1}`)
    .join(" AND ");
  const params = keyEntries.map(([, value]) => value);

  const sql = `DELETE FROM ${quoteIdent(table)} WHERE ${whereSql} RETURNING *`;
  const result = await pool.query(sql, params);
  if (result.rowCount === 0) {
    throw new Error("Строка не найдена");
  }
  return result.rows[0];
}
