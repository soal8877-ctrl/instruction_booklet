import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import {
  assertDbKey,
  assertTableName,
  getDbConfig,
  getPool,
} from "./db.js";
import {
  assertTableExists,
  deleteRow,
  getRows,
  getTableMeta,
  insertRow,
  listTables,
  updateRow,
} from "./metadata.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.VIEW_DB_PORT ?? 4000);

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "../public")));

app.get("/api/config", (_req, res) => {
  res.json(getDbConfig());
});

app.get("/api/:dbKey/tables", async (req, res) => {
  try {
    const dbKey = assertDbKey(req.params.dbKey);
    const pool = getPool(dbKey);
    const tables = await listTables(pool);
    res.json({ tables });
  } catch (error) {
    res.status(400).json({ error: message(error) });
  }
});

app.get("/api/:dbKey/tables/:table/meta", async (req, res) => {
  try {
    const dbKey = assertDbKey(req.params.dbKey);
    const table = assertTableName(req.params.table);
    const pool = getPool(dbKey);
    await assertTableExists(pool, table);
    const meta = await getTableMeta(pool, table);
    res.json(meta);
  } catch (error) {
    res.status(400).json({ error: message(error) });
  }
});

app.get("/api/:dbKey/tables/:table/rows", async (req, res) => {
  try {
    const dbKey = assertDbKey(req.params.dbKey);
    const table = assertTableName(req.params.table);
    const page = Math.max(1, Number(req.query.page ?? 1));
    const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize ?? 20)));
    const pool = getPool(dbKey);
    await assertTableExists(pool, table);
    const data = await getRows(pool, table, page, pageSize);
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: message(error) });
  }
});

app.post("/api/:dbKey/tables/:table/rows", async (req, res) => {
  try {
    const dbKey = assertDbKey(req.params.dbKey);
    const table = assertTableName(req.params.table);
    const pool = getPool(dbKey);
    await assertTableExists(pool, table);
    const row = await insertRow(pool, table, req.body ?? {});
    res.status(201).json({ row });
  } catch (error) {
    res.status(400).json({ error: message(error) });
  }
});

app.put("/api/:dbKey/tables/:table/rows", async (req, res) => {
  try {
    const dbKey = assertDbKey(req.params.dbKey);
    const table = assertTableName(req.params.table);
    const { keys, values } = req.body ?? {};
    const pool = getPool(dbKey);
    await assertTableExists(pool, table);
    const row = await updateRow(pool, table, keys ?? {}, values ?? {});
    res.json({ row });
  } catch (error) {
    res.status(400).json({ error: message(error) });
  }
});

app.delete("/api/:dbKey/tables/:table/rows", async (req, res) => {
  try {
    const dbKey = assertDbKey(req.params.dbKey);
    const table = assertTableName(req.params.table);
    const { keys } = req.body ?? {};
    const pool = getPool(dbKey);
    await assertTableExists(pool, table);
    const row = await deleteRow(pool, table, keys ?? {});
    res.json({ row });
  } catch (error) {
    res.status(400).json({ error: message(error) });
  }
});

function message(error: unknown): string {
  return error instanceof Error ? error.message : "Неизвестная ошибка";
}

app.listen(PORT, () => {
  console.log(`view-db: http://localhost:${PORT}`);
});
