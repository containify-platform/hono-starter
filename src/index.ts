import { Hono } from "hono";
import { logger } from "hono/logger";
import { sql } from "./db";

const app = new Hono();

app.use(logger());

app.get("/", (c) =>
	c.json({
		name: "hono-starter",
		message: "Hello from Hono on Containify",
		routes: ["GET /health", "GET /notes", "POST /notes"],
	}),
);

// The health check: answers as long as the server is up.
app.get("/health", (c) => c.text("ok"));

app.get("/notes", async (c) => {
	const notes = await sql`select id, body, created_at from notes order by id desc limit 50`;
	return c.json(notes);
});

app.post("/notes", async (c) => {
	const input = await c.req.json().catch(() => null);
	const body = typeof input?.body === "string" ? input.body.trim() : "";
	if (!body || body.length > 1000) return c.json({ error: "body must be 1 to 1000 characters" }, 400);
	const [note] = await sql`insert into notes (body) values (${body}) returning id, body, created_at`;
	return c.json(note, 201);
});

app.notFound((c) => c.json({ error: "not found" }, 404));

app.onError((err, c) => {
	console.error(err);
	return c.json({ error: "Internal Server Error" }, 500);
});

// Containify sets HOST=:: (IPv6 and IPv4). PORT is set by the template.
const server = Bun.serve({
	hostname: process.env.HOST ?? "::",
	port: Number(process.env.PORT ?? 3000),
	fetch: app.fetch,
});
console.log(`Listening on ${server.url}`);

// A deploy stops the old replica with SIGTERM: finish requests in flight, then exit.
process.on("SIGTERM", async () => {
	await server.stop();
	await sql.close();
	process.exit(0);
});
