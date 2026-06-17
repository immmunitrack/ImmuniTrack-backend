# JobConnect Backend

This repository contains the backend API for JobConnect, a learning project that shows students how to build a role-based job marketplace with Node.js, Express, JWT authentication, bcrypt password hashing, MariaDB/MySQL, and Multer file uploads.

The frontend lives in a separate repository named `jobconnect-frontend`.

## What This Backend Teaches

- How to structure an Express project with routes, controllers, middleware, and config files.
- How JWT authentication works in a real API.
- How role-based access control protects admin, employer, and job seeker routes.
- How to use bcrypt so plain text passwords are never stored.
- How to query MariaDB/MySQL with `mysql2/promise`.
- How to upload CV files with Multer.
- How to enforce ownership, for example employers can edit only their own jobs.

## Folder Structure

```text
jobconnect-backend/
  config/
    db.js                  # MySQL connection pool
  controllers/             # Request handlers and database logic
  middleware/              # Auth, role checks, and upload handling
  routes/                  # URL definitions that call controllers
  uploads/                 # CV files are stored here
  database/
    schema.sql             # Tables and relationships
    seed.sql               # Sample learning data
  server.js                # Express app entry point
  package.json
  .env.example
```

## Request Flow

1. A browser sends a request to an endpoint such as `POST /api/jobs`.
2. The route in `routes/jobRoutes.js` decides which middleware and controller should run.
3. `protect` in `middleware/authMiddleware.js` verifies the JWT and loads `req.user`.
4. `authorize` in `middleware/roleMiddleware.js` checks the user's role.
5. The controller validates input, runs SQL queries, and returns JSON.

## Requirements

- Node.js 18 or newer
- MariaDB or MySQL
- npm

## Setup

Install dependencies:

```bash
npm install
```

Create your environment file:

```bash
cp .env.example .env
```

Update `.env`:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=jobconnect
DB_PORT=3306
JWT_SECRET=replace_this_with_a_long_random_secret
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

Create and seed the database:

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

Start the backend:

```bash
npm run dev
```

The API runs at:

```text
http://localhost:5000
```

Health check:

```text
GET http://localhost:5000/api/health
```

## Default Seed Accounts

Use these accounts after loading `database/seed.sql`:

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@jobconnect.com` | `password123` |
| Employer | `employer1@jobconnect.com` | `password123` |
| Employer | `employer2@jobconnect.com` | `password123` |
| Job Seeker | `seeker1@jobconnect.com` | `password123` |
| Job Seeker | `seeker2@jobconnect.com` | `password123` |

## Main Endpoints

Auth:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

Profiles:

- `GET /api/profile`
- `PUT /api/profile/employer`
- `PUT /api/profile/job-seeker`

Jobs:

- `GET /api/jobs`
- `GET /api/jobs/:id`
- `GET /api/jobs/employer/my-jobs`
- `POST /api/jobs`
- `PUT /api/jobs/:id`
- `DELETE /api/jobs/:id`

Applications:

- `POST /api/applications/apply/:jobId`
- `GET /api/applications/my-applications`
- `GET /api/applications/job/:jobId`
- `PUT /api/applications/:id/status`

Admin:

- `GET /api/admin/stats`
- `GET /api/admin/users`
- `GET /api/admin/jobs`
- `GET /api/admin/applications`
- `PUT /api/admin/users/:id/status`

## Student Exercises

- Add validation for stronger passwords during registration.
- Add pagination to job browsing.
- Add an endpoint for admins to create another admin account.
- Store uploaded CVs in cloud storage instead of local disk.
- Add automated API tests for auth and job ownership rules.

## Useful Checks

```bash
node --check server.js
npm audit --omit=dev
```
