# ServiceMatch

A video-first marketplace that connects homeowners with verified service professionals through a swipe-style matching experience.

## Architecture

- **Frontend**: Next.js (web) in `client/`
- **Backend**: Node.js / Express in `server/`
- **Database**: PostgreSQL (Knex migrations in `server/migrations/`)
- **Real-time**: Socket.io
- **Payments**: Stripe (when configured)
- **Storage**: AWS S3 dependency present for future / partial video flows

A **React Native** app in `mobile/` is optional and not included in every checkout; root install scripts skip it when the folder is missing.

## Quick start

### Prerequisites

- Node.js 18+
- PostgreSQL (local or remote)

### 1. Install dependencies

From the repository root:

```bash
npm run install:all
```

This installs root, `server/`, and `client/` dependencies, and runs `npm install` in `mobile/` only if `mobile/package.json` exists.

### 2. Environment variables

```bash
cp .env.example .env
```

Edit `.env` with at least **database** credentials and **`JWT_SECRET`**. The API loads `.env` from the **repository root** (same file Knex uses when you run migrations from `server/`). The Next.js app reads **`NEXT_PUBLIC_API_URL`** for every REST and Socket.io call (see `client/lib/apiUrl.ts`); it defaults to `http://localhost:5000` when unset.

### 3. Database

```bash
createdb servicematch_dev   # or your DB_NAME from .env
cd server && npx knex migrate:latest && cd ..
```

On macOS with Homebrew, ensure PostgreSQL is running (for example `brew services start postgresql@16`). If login fails, set `DB_USER` in `.env` to your PostgreSQL role (often your macOS username or `postgres`).

### 4. Run the stack

```bash
npm run dev
```

- API: [http://localhost:5000](http://localhost:5000) (or `PORT` from `.env`)
- Web app: [http://localhost:3000](http://localhost:3000)

Optional: set `NEXT_PUBLIC_API_URL` in `.env` if the client should call a non-default API URL (see `client/components/Chat.tsx`).

### Backend tests

```bash
cd server && npm test
```

## Project layout

```
├── client/           # Next.js web app
├── server/           # Express API, Knex, migrations, Jest tests
├── scripts/          # Helper scripts (e.g. optional mobile install)
├── package.json      # Root workspace scripts (concurrently, install:all)
├── .env.example      # Template for root .env
├── SETUP_GUIDE.md    # Detailed setup and troubleshooting
├── FIX_PLAN.md       # Engineering fix / rollout notes
└── install.sh        # Interactive installer (bash)
```

## Documentation

- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** — environment variables, DB, ports, tests, deployment notes
- **[DEVELOPMENT_WORKFLOW.md](./DEVELOPMENT_WORKFLOW.md)** — workflow conventions
- **[PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)** — product / technical overview

## Roadmap highlights

- Hardening auth, matching, messaging, and payments
- Video upload and storage
- Optional mobile app in `mobile/` when added to the tree
