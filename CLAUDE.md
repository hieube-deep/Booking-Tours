# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Booking Tours is a full-stack tour booking app: a Vite/React/TypeScript client and a
Node/Express backend, developed as two independent npm projects (no root `package.json`
or workspace tooling — always `cd client` or `cd server` first).

## Commands

Backend (`server/`):
```
npm run dev          # nodemon + babel-node, starts server/src/app.js (default port 5000)
```
There is no build/lint/test script for the backend. It's plain ESM JavaScript run through
Babel (not TypeScript, despite what the root README says).

Frontend (`client/`):
```
npm run dev           # vite dev server (port 5173)
npm run build          # tsc -b && vite build
npm run lint            # eslint .
npm run preview        # preview production build
npm run db              # json-server db.json --port 3000 (mock data, unrelated to real API)
```
There is no test suite in either package — verify changes by running the dev servers, not
by looking for a test command.

Backend setup: copy `server/.env.example` to `server/.env` and fill in `MONGO_URI`,
`SECRET_KEY` (JWT), and the `VNPAY_*` sandbox credentials. Mongo must be running locally
(or `MONGO_URI` pointed at a reachable instance) for `npm run dev` to succeed.

## Backend architecture (`server/src`)

Layering: `routes/*.route.js` → `controllers/*.controller.js` → `models/*.model.js`
(Mongoose). Every controller action is wrapped in `utils/asyncHandler.js` instead of
try/catch, and responses are always `{ success, message?, data|<entity> }` JSON.

- `app.js` wires `cors`, `express.json()`, mounts everything under `/api` via
  `routes/index.js`, then connects Mongoose before calling `app.listen`.
- `routes/index.js` only mounts `auth`, `tours`, `admin`, `reviews`, `bookings`, and
  `payments`. Route files for `departures`, `promotions`, `wishlist`, and `guides` exist
  under `routes/` and `controllers/` but are **not** wired into `routes/index.js` — if
  you're asked to work on those features, you likely need to mount the router first.
- Auth: `middlewares/auth.middlewares.js` exports `protect` (verifies the `Bearer` JWT,
  loads `req.user` from Mongo) and `adminOnly` (checks `req.user.role === "admin"`).
  Routes compose them directly, e.g. `TourRouter.post('/', protect, adminOnly, createTour)`.
- Lookups by id-or-slug: several `getById` controllers (see `tours.controller.js`) accept
  either a Mongo ObjectId or a slug in the same `:id` param, testing with a 24-hex-char
  regex before falling back to a slug query.
- Payments: `controllers/payments.controller.js` implements the VNPay redirect flow —
  builds an HMAC-SHA512-signed query string for the pay URL, verifies the signature on
  `handleVnpayReturn`, updates `Payment`/`Booking` status, then redirects the browser to
  `${CLIENT_URL}/payment-result` with status query params. Treat the signing/verification
  helpers as security-sensitive if touched.
- Many user-facing strings (error messages, log lines) are in Vietnamese without diacritics
  — match the existing tone/language when adding new ones rather than switching to English.

## Frontend architecture (`client/src`)

- Path alias `@/*` → `src/*` (configured in both `vite.config.ts` and `tsconfig.app.json`).
- Data fetching goes through `@tanstack/react-query`; each resource has a thin `api/*Api.ts`
  wrapper around the shared `api/axiosClient.ts` instance, and a `hooks/use*.ts` hook that
  wraps the query/mutation (see `hooks/useTours.ts` + `api/tourApi.ts` as the template).
- `api/axiosClient.ts` auto-attaches the JWT from `utils/storage.ts` on every request, and
  its response interceptor unwraps `response.data` (so callers get the API payload
  directly) and force-redirects to `/login` on a 401 — except for the login/register calls
  themselves, which are excluded so failed-login errors surface normally.
- Auth state lives in `contexts/AuthContext.tsx`, consumed via `hooks/useAuth.ts`, backed by
  `utils/storage.ts` (localStorage) and hydrated once on mount.
- Routing (`App.tsx`) nests three layouts — `AuthLayout` (login/register), `AdminLayout`
  (admin-only), `MainLayout` (everything else) — and gates protected pages with
  `components/ProtectedRoute.tsx`, which takes an optional `requiredRole` prop and redirects
  unauthenticated users to `/login` (preserving `location.state.from`) or unauthorized users
  to `/`.
- Pages are grouped by feature under `pages/<Feature>/<Page>.tsx` (e.g. `pages/Tours/`,
  `pages/Admin/`, `pages/Booking/`); shared primitives live in `components/ui/`.
- Styling is Tailwind v4 via the `@tailwindcss/vite` plugin (no separate Tailwind config
  file — see `vite.config.ts`). The React Compiler is enabled through
  `babel-plugin-react-compiler` (also wired in `vite.config.ts`), so avoid manual
  `useMemo`/`useCallback` unless profiling shows it's needed.

## Conventions

- TypeScript: no `any`; centralize shared types under `client/src/types/`.
- Never change an existing API request/response contract without calling it out explicitly
  — frontend `api/*.ts` and backend `controllers/*.js` must be updated together.
- Commit messages follow Conventional Commits (`feat:`, `fix:`, `refactor:`, etc.).
