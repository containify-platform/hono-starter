import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { sql } from "./db";

// Applies migrations/*.sql in name order, each once, each in a transaction.
// Containify runs it before every deploy (the template's pre-deploy command).

const dir = join(import.meta.dir, "../migrations");

await sql`create table if not exists schema_migrations (name text primary key, applied_at timestamptz not null default now())`;
const applied = new Set((await sql`select name from schema_migrations`).map((r: { name: string }) => r.name));

for (const name of (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort()) {
	if (applied.has(name)) continue;
	const text = await Bun.file(join(dir, name)).text();
	await sql.begin(async (tx) => {
		await tx.unsafe(text);
		await tx`insert into schema_migrations (name) values (${name})`;
	});
	console.log(`applied ${name}`);
}

console.log("migrations up to date");
await sql.close();
