import { SQL } from "bun";

// DATABASE_URL comes from the Postgres app: {{ "Postgres".DATABASE_URL }}.
export const sql = new SQL(process.env.DATABASE_URL ?? "postgres://postgres:postgres@localhost:5432/app");
