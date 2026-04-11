import crypto from "crypto";
import { getSql } from "./db";

type JsonRecord = Record<string, any>;
type WhereClause = { field: string; op: string; value: unknown };
type OrderClause = { field: string; direction: "asc" | "desc" };

const COLLECTION_TABLES: Record<string, string> = {
  users: "users",
  profiles: "profiles",
  documents: "documents",
  tax_returns: "tax_returns",
  user_services: "user_services",
  blog_posts: "blog_posts",
  categories: "categories",
  daily_updates: "daily_updates",
  activity_logs: "activity_logs",
  audit_logs: "audit_logs",
  referrals: "referrals",
  teams: "teams",
  notifications: "notifications",
  workflows: "workflows",
  reports: "reports",
  chat_sessions: "chat_sessions",
  chat_messages: "chat_messages",
  document_drafts: "document_drafts",
  site_settings: "site_settings",
  email_templates: "email_templates",
  pages: "pages",
};

function tableFor(collectionName: string) {
  const table = COLLECTION_TABLES[collectionName];
  if (!table) {
    throw new Error(`No Neon table mapping configured for collection '${collectionName}'`);
  }
  return table;
}

function assertJsonField(field: string) {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(field)) {
    throw new Error(`Invalid JSON field '${field}'`);
  }
  return field.replace(/'/g, "''");
}

function sanitizeForJson(value: unknown): unknown {
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(sanitizeForJson);
  if (value && typeof value === "object") {
    const next: JsonRecord = {};
    Object.entries(value as JsonRecord).forEach(([key, entry]) => {
      if (entry !== undefined) {
        next[key] = sanitizeForJson(entry);
      }
    });
    return next;
  }
  return value;
}

function normalizeData(id: string, data: JsonRecord = {}) {
  return {
    ...data,
    id: data.id ?? id,
  };
}

function fromRow(row: any) {
  return normalizeData(row.id, row.data ?? {});
}

function buildWhere(clauses: WhereClause[], params: unknown[]) {
  if (clauses.length === 0) return "";

  const sqlParts = clauses.map((clause) => {
    if (clause.op !== "==") {
      throw new Error(`Unsupported query operator '${clause.op}'`);
    }

    const field = assertJsonField(clause.field);
    const textValue = String(clause.value);
    const jsonValue = JSON.stringify({ [clause.field]: sanitizeForJson(clause.value) });

    if (clause.field === "id") {
      params.push(textValue);
      const idParam = params.length;
      return `(id = $${idParam} OR data ->> 'id' = $${idParam})`;
    }

    params.push(jsonValue);
    const jsonParam = params.length;
    params.push(textValue);
    const textParam = params.length;
    return `(data @> $${jsonParam}::jsonb OR data ->> '${field}' = $${textParam})`;
  });

  return ` WHERE ${sqlParts.join(" AND ")}`;
}

function buildOrder(order: OrderClause[]) {
  if (order.length === 0) return "";

  return ` ORDER BY ${order
    .map((clause) => {
      const field = assertJsonField(clause.field);
      const direction = clause.direction === "desc" ? "DESC" : "ASC";
      return `COALESCE(data ->> '${field}', '') ${direction}`;
    })
    .join(", ")}`;
}

export class NeonDocumentSnapshot {
  constructor(
    public readonly id: string,
    private readonly value: JsonRecord | null,
    public readonly ref?: NeonDocumentRef,
  ) {}

  get exists() {
    return Boolean(this.value);
  }

  data() {
    return this.value ? { ...this.value } : undefined;
  }
}

export class NeonQuerySnapshot {
  constructor(public readonly docs: NeonDocumentSnapshot[]) {}

  get empty() {
    return this.docs.length === 0;
  }

  get size() {
    return this.docs.length;
  }
}

class NeonCountSnapshot {
  constructor(private readonly count: number) {}

  data() {
    return { count: this.count };
  }
}

export class NeonDocumentRef {
  constructor(
    private readonly collectionName: string,
    public readonly id: string,
  ) {}

  async get() {
    const table = tableFor(this.collectionName);
    const rows = await getSql().query(`SELECT id, data FROM ${table} WHERE id = $1 LIMIT 1`, [this.id]);
    const row = rows[0];
    return new NeonDocumentSnapshot(this.id, row ? fromRow(row) : null, this);
  }

  async set(data: JsonRecord, options?: { merge?: boolean }) {
    const table = tableFor(this.collectionName);
    const current = options?.merge ? await this.get() : null;
    const payload = normalizeData(
      this.id,
      sanitizeForJson({
        ...(current?.data() ?? {}),
        ...data,
      }) as JsonRecord,
    );

    await getSql().query(
      `INSERT INTO ${table} (id, data, created_at, updated_at)
       VALUES ($1, $2::jsonb, NOW(), NOW())
       ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()`,
      [this.id, JSON.stringify(payload)],
    );
  }

  async update(data: JsonRecord) {
    const current = await this.get();
    if (!current.exists) {
      throw new Error(`Document '${this.collectionName}/${this.id}' does not exist`);
    }

    await this.set(data, { merge: true });
  }

  async delete() {
    const table = tableFor(this.collectionName);
    await getSql().query(`DELETE FROM ${table} WHERE id = $1`, [this.id]);
  }
}

class NeonQuery {
  constructor(
    private readonly collectionName: string,
    private readonly clauses: WhereClause[] = [],
    private readonly order: OrderClause[] = [],
    private readonly maxRows?: number,
  ) {}

  where(field: string, op: string, value: unknown) {
    return new NeonQuery(
      this.collectionName,
      [...this.clauses, { field, op, value }],
      this.order,
      this.maxRows,
    );
  }

  orderBy(field: string, direction: "asc" | "desc" = "asc") {
    return new NeonQuery(
      this.collectionName,
      this.clauses,
      [...this.order, { field, direction }],
      this.maxRows,
    );
  }

  limit(maxRows: number) {
    return new NeonQuery(this.collectionName, this.clauses, this.order, maxRows);
  }

  async get() {
    const table = tableFor(this.collectionName);
    const params: unknown[] = [];
    const whereSql = buildWhere(this.clauses, params);
    const orderSql = buildOrder(this.order);
    const limitSql = this.maxRows ? ` LIMIT ${Math.max(1, Math.floor(this.maxRows))}` : "";
    const rows = await getSql().query(`SELECT id, data FROM ${table}${whereSql}${orderSql}${limitSql}`, params);
    return new NeonQuerySnapshot(
      rows.map((row: any) => new NeonDocumentSnapshot(row.id, fromRow(row), new NeonDocumentRef(this.collectionName, row.id))),
    );
  }

  count() {
    return {
      get: async () => {
        const table = tableFor(this.collectionName);
        const params: unknown[] = [];
        const whereSql = buildWhere(this.clauses, params);
        const rows = await getSql().query(`SELECT COUNT(*)::int AS count FROM ${table}${whereSql}`, params);
        return new NeonCountSnapshot(Number(rows[0]?.count ?? 0));
      },
    };
  }
}

class NeonCollectionRef extends NeonQuery {
  constructor(private readonly name: string) {
    super(name);
  }

  doc(id?: string) {
    id ??= crypto.randomUUID();
    return new NeonDocumentRef(this.name, id);
  }

  async add(data: JsonRecord) {
    const ref = this.doc();
    await ref.set(data);
    return ref;
  }
}

export const adminDb = {
  collection(name: string) {
    return new NeonCollectionRef(name);
  },
};

export type NeonAdminDb = typeof adminDb;
