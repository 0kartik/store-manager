# Store Rating Platform

A full stack web application built for the Roxiler Systems internship assessment. The platform allows users to rate registered stores on a scale of 1 to 5, with separate dashboards for system administrators, normal users, and store owners.

## Tech Stack

- Backend: Express.js with raw SQL queries via the `pg` library
- Database: PostgreSQL
- Frontend: React (Vite)
- Authentication: JWT based, with role based access control


## Roles and Features

**System Administrator**
- Dashboard showing total users, total stores, and total ratings
- Add new users and stores (any role, including additional admins)
- View and filter users and stores by name, email, address, and role
- Sort listings by any column
- Backend route for viewing a single user's details, including their rating if they are a Store Owner, is implemented at `GET /admin/users/:id`. A UI entry point for this (a "View" link or modal on the Users tab) is the one remaining piece to confirm and wire up before submission.

**Normal User**
- Sign up and log in
- Browse stores and search by name and address
- View store name, address, overall rating, and their own submitted rating
- Submit and modify a rating (1 to 5) for any store
- Update password after logging in

**Store Owner**
- Dashboard showing the average rating for their store
- View the list of users who have rated their store
- Update password after logging in

All form inputs are validated on both the client and server side, including:
- Name: 20 to 60 characters
- Address: up to 400 characters
- Password: 8 to 16 characters, including at least one uppercase letter and one special character
- Email: standard email format

## Getting Started

### 1. Database Setup

This project requires a PostgreSQL database. A Supabase project works well for this.

1. Go to supabase.com and open your project (or create a new one)
2. Navigate to Project Settings > Database
3. Copy the connection string under "Connection string" (URI)
4. This becomes your `DATABASE_URL`

A local PostgreSQL installation works equally well if preferred.

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and add your `DATABASE_URL` and a `JWT_SECRET` value.

Apply the schema:

```bash
psql "$DATABASE_URL" -f src/db/schema.sql
```

Seed the default administrator account:

```bash
npm run seed
```

This creates an admin account with the credentials below. Log in and change the password after the first session.

```
Email: admin@storerating.com
Password: Admin@1234
```

Start the backend server:

```bash
npm run dev
```

The server runs on port 5000 by default. You can verify it is running with:

```bash
curl http://localhost:5000/api/health
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The application runs at http://localhost:5173. The Vite development server proxies `/api` requests to port 5000, so the backend should be running before starting the frontend.

## Verifying the Application

1. Log in as the administrator using the seeded credentials. The dashboard should load with zero users, stores, and ratings.
2. Create a new user with the role "Store Owner."
3. Create a new store and assign it to the store owner using their user ID (visible in the Users tab, or via `SELECT id, email FROM users WHERE role='STORE_OWNER';`).
4. Log out and register a new normal user account.
5. Browse stores and submit a rating for the store created earlier.
6. Log out and log in as the store owner to confirm the rating and average appear correctly.
7. Log out and log in as the administrator to confirm the dashboard counts have updated.

## Project Structure

```
backend/
  src/
    db/          Database connection, schema, and seed script
    middleware/  Authentication middleware
    routes/      Admin, auth, store, and user routes
    utils/       JWT helpers and input validators

frontend/
  src/
    components/  Navbar and sortable table components
    context/     Authentication context
    pages/       Login, signup, and dashboard pages
```