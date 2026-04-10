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

- [x] `create-payment-intent`: caller must be the **job owner (customer)** for the match; non-participants **403**; unknown match **404**; professionals on the match **403** (only the payer creates the intent).
- [x] `confirm-payment`: caller must be the job’s **customer** for the stored payment row; mismatching Stripe `metadata.userId` (when present) **403**; otherwise **403** / **404** as appropriate before calling Stripe.
- [x] Cross-account attempts (user A, user B’s match/payment) fail with **401** (no token) or **403** (forbidden), never **200** with another user’s data.

**Messages** (`server/routes/messages.js`)

- [x] Read/send: membership via `getMatchAccess`; unknown match **404**; known match, not a participant **403**.
- [x] `mark-read`: membership enforced before update; only messages in that match from **other** senders are marked read.

**Tests**

- [x] Route-level tests in `server/__tests__/payments.messages.authz.test.js` (+ `matchMembership.test.js` for access helper).

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

- [x] Unauthorized access tests: **401** / **403** as specified (Phase 1 routes).
- [x] Payment and message endpoints enforce ownership/membership.
- [ ] Match payloads complete and consistent across consumers.
- [ ] Frontend uses env-based API URL only.
- [ ] `npm run install:all` + docs yield successful first-time setup.
- [ ] App boots: client + server + health endpoint.
