# JobConnect Backend

Express.js API for JobConnect with JWT authentication, role-based access control, MariaDB/MySQL persistence, bcrypt password hashing, and Multer CV uploads.

## Setup

```bash
cp .env.example .env
npm install
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
npm run dev
```

Update `.env` with your local database credentials and a strong `JWT_SECRET`.

Default seeded password for all accounts:

```text
password123
```

Useful accounts:

- Admin: `admin@jobconnect.com`
- Employer: `employer1@jobconnect.com`
- Job seeker: `seeker1@jobconnect.com`

Health check:

```text
GET http://localhost:5000/api/health
```
