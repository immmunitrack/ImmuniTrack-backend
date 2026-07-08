# MamaCare Backend

MamaCare Backend is the Node.js API for the MamaCare Immunisation Tracker. It stores caregivers, children, vaccine schedules, immunisation records, reminders, health facilities, and admin reporting data.

This folder is a separate backend repo. Run it together with the `mamacare-frontend` repo.

## Technologies

- Node.js and Express.js for the REST API
- MySQL or MariaDB for the database
- mysql2 for database queries
- JSON Web Tokens for login sessions
- bcrypt for password hashing
- CORS for browser access from the React frontend
- Multer for PDF upload handling
- Nodemon for development reloads

## Main Features

- Register and log in caregivers, admins, and health workers
- Register children and generate vaccine due dates from date of birth
- Track completed, pending, upcoming, and missed immunisations
- Generate reminder records for upcoming and overdue visits
- Manage editable immunisation schedule items
- Store health facilities and admin dashboard statistics
- Provide seeded demo users and sample immunisation data

## Requirements

- Node.js 18 or newer
- npm
- MySQL or MariaDB running locally
- The `mamacare-frontend` repo for the browser interface

## Setup

1. Install dependencies:

```bash
npm install
```

1. Create your environment file:

```bash
cp .env.example .env
```

1. Open `.env` and confirm your database settings:

```env
PORT=5050
FRONTEND_URL=http://localhost:5173
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=mamacare_immunisation
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
```

Use your own MySQL username and password if they are different.

## Database Setup

Import the schema first, then the seed data:

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

The seed file creates demo accounts, children, vaccine schedule records, health facilities, immunisation records, and reminders.

## Run The API

```bash
npm run dev
```

The API runs at:

```text
http://localhost:5050/api
```

Health check:

```bash
curl http://localhost:5050/api/health
```

Expected result:

```json
{"status":"ok","database":"connected"}
```

## Demo Login Accounts

- Admin or health worker: `admin@mamacare.test` / `Admin123!`
- Caregiver: `amina@mamacare.test` / `Care123!`
- Caregiver: `sarah@mamacare.test` / `Care123!`
- Caregiver: `prossy@mamacare.test` / `Care123!`

## Project Structure

```text
config/       Database connection
controllers/  Request handlers for each feature
database/     SQL schema and seed files
middleware/   Auth and upload middleware
routes/       API route definitions
services/     Immunisation and reminder business logic
server.js     Express app entry point
```

## Useful Scripts

```bash
npm run dev    # Start development server with nodemon
npm start      # Start production-style server with node
```

## Learning Notes

Start with `server.js` to see how middleware and routes are connected. Then read the matching route and controller files, for example `routes/childRoutes.js` and `controllers/childController.js`. The due date logic lives in `services/immunisationCalculator.js`.

MamaCare is a learning project and reminder tool. It does not replace advice from a qualified health worker.
