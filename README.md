# Hono API starter

[![Deploy on Containify](https://containify.cloud/deploy-button.svg)](https://containify.cloud/templates/hono)

A small [Hono](https://hono.dev) API on [Bun](https://bun.sh) with a Postgres database, ready to deploy on [Containify](https://containify.cloud).

- `GET /` says hello and lists the routes
- `GET /health` answers `ok` (the health check)
- `GET /notes` and `POST /notes` (`{"body": "..."}`) read and write the `notes` table
- `src/migrate.ts` applies `migrations/*.sql` in order, once each, using Bun's built-in Postgres client

## Run locally

You need Bun 1.x and a Postgres database.

```bash
bun install
export DATABASE_URL=postgres://postgres:postgres@localhost:5432/app
bun run migrate
bun run dev
```

Then open http://localhost:3000.

## Deploy on Containify

[![Deploy on Containify](https://containify.cloud/deploy-button.svg)](https://containify.cloud/templates/hono)

One click deploys it on [Containify](https://containify.cloud). The [template page](https://containify.cloud/templates/hono) shows what it creates, and passwords, connection strings and the HTTPS address are filled in for you.

Deploy the **Hono API starter** template from the catalogue (`containify templates deploy hono`). It builds this repository with its Dockerfile and adds:

- **API**: this app, on a public HTTPS endpoint, with `/health` as its health check. Its pre-deploy command, `bun run src/migrate.ts`, runs the migrations before each release takes traffic.
- **Postgres**: Postgres 17 on a volume, reachable only over the private network. The API's `DATABASE_URL` references it.

To make it yours, fork this repository, then point the API app's source at your fork.

## Notes

- Containify sets `HOST=::` on every app; the server listens there (IPv6 and IPv4). The template sets `PORT=3000`.
- Add a migration by dropping a new file into `migrations/`, e.g. `0002_add_tags.sql`. Names sort in the order they run.
- On `SIGTERM` the server finishes requests in flight before exiting, so deploys don't cut requests off.

## License

MIT

---

Made by [Containify](https://containify.cloud): deploy apps, databases and workers from a Git repo or an image, with per-second billing. [Docs](https://containify.cloud/docs) · [Templates](https://containify.cloud/templates)
