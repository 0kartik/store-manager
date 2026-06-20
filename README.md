# Store Rating Platform

Full-stack app: Express + PostgreSQL (raw SQL via `pg`) + React (Vite).

## 0. Get a Postgres database (2 minutes, no local install)
You already have a Supabase account from QuickDyne/G-KAP. Fastest path:
1. Go to supabase.com → your project (or create a new one) → Project Settings → Database.
2. Copy the **Connection string** (URI, "Transaction pooler" or "Direct connection" both work).
3. That's your `DATABASE_URL`.

(If you'd rather run Postgres locally, that works too — just point `DATABASE_URL` at it.)

## 1. Backend setup
```bash
cd backend
npm install
cp .env.example .env
# edit .env: paste your DATABASE_URL and set a random JWT_SECRET
```

Create the schema (run this SQL against your DB — easiest via Supabase's SQL editor, or psql):
```bash
psql "$DATABASE_URL" -f src/db/schema.sql
```

Seed the admin account:
```bash
npm run seed
```
This prints the admin email/password (admin@storerating.com / Admin@1234). Log in with that, then change the password.

Start the server:
```bash
npm run dev
```
Should print `Server running on port 5000`. Test it: `curl http://localhost:5000/api/health`

## 2. Frontend setup
```bash
cd frontend
npm install
npm run dev
```
Open http://localhost:5173. The Vite dev server proxies `/api` to localhost:5000, so don't change ports unless you update vite.config.js too.

## 3. Walkthrough to verify everything works (do this before you submit)
1. Log in as admin (admin@storerating.com / Admin@1234) → Admin Dashboard loads with 0/0/0 stats.
2. Add User → create a Store Owner (role = STORE_OWNER).
3. Add Store → create a store, set Owner user ID to the store owner's id (check the Users tab for their id — you may need to expose ids in the table or query the DB directly: `SELECT id, email FROM users WHERE role='STORE_OWNER';`).
4. Logout → Sign Up as a new normal user.
5. Go to Browse Stores → rate the store you created.
6. Logout → log in as the store owner → see the rating and average on their dashboard.
7. Logout → log in as admin → confirm the dashboard counts updated.

## What's covered vs. spec
- Single login, 3 roles, role-based routing — done.
- Admin: dashboard stats, add user/store (any role), filterable+sortable user/store lists, user detail with rating-if-store-owner (backend route `/admin/users/:id` exists; not yet wired to a detail page in the UI — add a "View" link/modal if you have spare time before submitting).
- Normal user: signup, browse/search stores, submit/modify rating (1-5), change password — done.
- Store owner: dashboard with raters list + average rating, change password — done.
- Validation rules (name 20-60, address ≤400, password 8-16 + uppercase + special, email format) — enforced both client-side and server-side.
- Sorting on key fields — done (click column headers).

## Known gaps if a reviewer pokes hard
- No automated tests (skip unless you have hours to spare — not worth it in 24h).
- Admin "Add Store" requires you to type an owner's user ID manually instead of picking from a dropdown — fine for a 24h build, mention it as a "next step" if asked.
- No pagination — fine for a sample dataset; mention as a scaling consideration if asked in an interview.
