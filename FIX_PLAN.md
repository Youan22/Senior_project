# Fix execution plan — acceptance criteria

This document defines **done** for each phase before implementation work is considered complete.  
Branch for this work: `hotfix/security-and-config-v2` (replaces deleted `hotfix/security-and-config` after history alignment).

---

## Phase 0: Stabilize and branch

- [x] Dedicated fix branch exists on GitHub and shares history with `main`.
- [x] Baseline snapshot: key routes probed (auth, matches, messages, payments) and responses noted (curl/Postman).
- [x] App boots: client + server; `GET /api/health` returns 200 when server is running.
- [x] This file exists and lists acceptance criteria for Phases 1–5 below.

---

## Phase 1: Security / AuthZ hardening

**Payments** (`server/routes/payments.js`)

- [ ] `create-payment-intent`: caller is verified as a participant in the match (customer for that job or matched professional); otherwise **403** (or documented policy).
- [ ] `confirm-payment`: caller may only confirm payments tied to matches they are allowed to access; otherwise **403**.
- [ ] Cross-account attempts (user A, user B’s match/payment) fail with **401** (no/invalid token) or **403** (forbidden), never **200** with another user’s data.

**Messages** (`server/routes/messages.js`)

- [ ] Read/send: membership in `matchId` enforced (already partially present); unauthorized access returns **403** (not only 404) if that is the chosen policy.
- [ ] `mark-read`: same membership check before any update; only messages in that match and only those the caller may mark read are updated.

**Tests**

- [ ] Route-level tests: user A cannot access user B’s match/payment/message flows (assert status codes).

---

## Phase 2: Data correctness (matches)

- [ ] `job_created_at` (or equivalent) is selected and mapped consistently on **all** match list endpoints (including professional routes).
- [ ] Test or automated assertion on response shape and sorting where applicable.
- [ ] Customer/professional dashboards manually or E2E-checked against updated API.

---

## Phase 3: Environment / config

- [ ] No hardcoded `http://localhost:5000` in frontend app code; single base URL helper (e.g. `client/lib/api.ts`).
- [ ] `NEXT_PUBLIC_API_URL` used consistently; `next.config.js` aligned with runtime env docs.
- [ ] Documented switch between local/dev/prod-like URLs without code edits.

---

## Phase 4: Setup / docs

- [ ] Root `install:all` does not require a missing `mobile/` directory.
- [ ] `.env.example` at repo root with all required keys (no secrets).
- [ ] README / SETUP match actual repo layout and commands.
- [ ] Clean clone + documented steps completes install and boot.

---

## Phase 5: Repo hygiene

- [ ] `node_modules` not tracked; `.gitignore` covers dependencies and build artifacts.
- [ ] Lockfiles kept; `npm install` / build sanity after cleanup documented or scripted.

---

## Validation checklist (before close)

- [ ] Unauthorized access tests: **401** / **403** as specified.
- [ ] Payment and message endpoints enforce ownership/membership.
- [ ] Match payloads complete and consistent across consumers.
- [ ] Frontend uses env-based API URL only.
- [ ] `npm run install:all` + docs yield successful first-time setup.
- [ ] App boots: client + server + health endpoint.
