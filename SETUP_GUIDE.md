# ServiceMatch setup guide

## Current features (high level)

- User authentication (customer and professional)
- Customer jobs and dashboards
- Professional profile, matches, and dashboards
- Real-time messaging (Socket.io)
- PostgreSQL schema via Knex migrations
- REST APIs for core flows; Stripe when keys are set

## Quick start

### 1. Install dependencies

From the **repository root**:

```bash
npm run install:all
```

This installs:

- Root (e.g. `concurrently`)
- `server/` and `client/`
- `mobile/` **only if** `mobile/package.json` exists

To install manually:

```bash
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..
# Optional, if present:
# cd mobile && npm install && cd ..
```

### 2. Environment variables

Create a single **root** `.env` (the server loads `../.env` relative to `server/`):

```bash
cp .env.example .env
```

Edit `.env`. Minimum for local API + migrations:

- `DB_*` — PostgreSQL connection
- `JWT_SECRET` — strong random string

See **`.env.example`** for all keys and comments. Optional: `STRIPE_SECRET_KEY`, `CLIENT_URL` / `CLIENT_URLS`. Set **`NEXT_PUBLIC_API_URL`** if the API is not at `http://localhost:5000`.

### 3. Database

Ensure PostgreSQL is running, then create the database (name should match `DB_NAME` in `.env`, default `servicematch_dev`):

```bash
createdb servicematch_dev
cd server
npx knex migrate:latest
cd ..
```

**macOS (Homebrew):** often `brew services start postgresql@16` (version may vary). If `psql` connects as your macOS user, set `DB_USER` in `.env` to that user or create a `postgres` role as needed.

**Linux:** e.g. `sudo service postgresql start` (distribution-dependent).

### 4. Start development

From the repository root:

```bash
npm run dev
```

Runs the API and Next.js together via `concurrently`.

Individually:

```bash
npm run server:dev    # backend (default :5000)
npm run client:dev    # frontend (default :3000)
```

If you have a `mobile/` app:

```bash
npm run mobile:dev
```

## VS Code

Recommended extensions (see also `client/.vscode/extensions.json` if present):

- Tailwind CSS IntelliSense (`bradlc.vscode-tailwindcss`)
- Prettier (`esbenp.prettier-vscode`)
- TypeScript support

Project/editor hints may live under `client/.vscode/`.

## Styling (client)

- Tailwind: `client/tailwind.config.js`
- PostCSS: `client/postcss.config.js`
- Globals: `client/styles/globals.css`

If the project defines a CSS lint script:

```bash
cd client && npm run lint:css
```

## Database maintenance

```bash
cd server
npx knex migrate:latest
npx knex migrate:rollback
npx knex seed:run   # if seeds exist
```

## Environment variables (reference)

| Area | Variables |
|------|-----------|
| Database | `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` |
| Auth | `JWT_SECRET` |
| Server | `PORT`, `NODE_ENV` |
| CORS / Socket.io | `CLIENT_URL`, optional `CLIENT_URLS` (comma-separated) |
| Client (browser) | `NEXT_PUBLIC_API_URL` — API origin for all `fetch` and Socket.io (default `http://localhost:5000` in `client/lib/apiUrl.ts`) |
| Payments | `STRIPE_SECRET_KEY` |
| AWS (future / uploads) | `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_S3_BUCKET` |

Copy from `.env.example` and adjust for your machine.

## Troubleshooting

### CSS / Tailwind in the editor

If you see unknown `@tailwind` warnings, install the Tailwind extension and restart the editor, or run any CSS lint fix script defined in `client/package.json`.

### Database connection errors

- Confirm PostgreSQL is running and `DB_*` in **root** `.env` matches how you connect with `psql`.
- Remember: both the running server and `npx knex` use the **repository root** `.env` (not only `server/.env`).

### Port conflicts

```bash
lsof -i :3000
lsof -i :5000
# stop the listed process if needed
```

## Testing

```bash
cd server && npm test
```

Add or run client tests only if defined in `client/package.json`.

## Repository hygiene

- Do not commit `node_modules/` or build output such as `client/.next/`; both are ignored via `.gitignore`.
- Keep **`package-lock.json`** files (root, `client/`, `server/`) in version control; do not commit `yarn.lock` or `pnpm-lock.yaml` unless the project standardizes on those tools.
- After a fresh clone or after deleting `node_modules`, sanity-check:

```bash
npm run install:all
cd server && npm test && cd ..
npm run build
```

## Production notes

- Set `NODE_ENV=production` and production `DB_*`, `JWT_SECRET`, `CLIENT_URL`, Stripe keys, and AWS as needed.
- Build the web app: `cd client && npm run build`
- Start the API: `cd server && npm start`

---

For questions, open an issue on the repository or follow **DEVELOPMENT_WORKFLOW.md**.
