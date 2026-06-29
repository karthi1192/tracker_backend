# DHPL Backend – Setup Guide

## 1. Install PostgreSQL
Download from https://www.postgresql.org/download/windows/ and install.
Remember your postgres password.

## 2. Create the database
Open pgAdmin or run in Command Prompt:
```
psql -U postgres -c "CREATE DATABASE dhpl_db;"
psql -U postgres -d dhpl_db -f db/schema.sql
psql -U postgres -d dhpl_db -f db/seed.sql
```

## 3. Google OAuth credentials
1. Go to https://console.cloud.google.com
2. Create a project → APIs & Services → Credentials → Create OAuth 2.0 Client ID
3. Application type: Web application
4. Authorized redirect URIs: http://localhost:3001/auth/google/callback
5. Copy Client ID and Client Secret

## 4. Create .env file
Copy .env.example to .env and fill in:
```
DB_PASSWORD=your_postgres_password
GOOGLE_CLIENT_ID=paste_here
GOOGLE_CLIENT_SECRET=paste_here
SESSION_SECRET=any_long_random_string
```

## 5. Install dependencies & run
```
npm install
npm run dev
```

Backend runs at http://localhost:3001

## 6. Frontend
Copy D:\dhpl_frontend\src\api.ts into your existing Vite project (D:\dhpl_frontend\src\)
then run the Vite dev server as usual (npm run dev → http://localhost:5173)

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /auth/google | Redirect to Google login |
| GET | /auth/me | Get current user |
| POST | /auth/logout | Log out |
| GET | /api/tasks?date=YYYY-MM-DD | Get tasks for a date |
| POST | /api/tasks | Create task |
| PATCH | /api/tasks/:id | Update elapsed/status |
| DELETE | /api/tasks/:id | Delete task |
| GET | /api/meetings?from=DATE&to=DATE | Get meetings range |
| POST | /api/meetings | Add meeting |
| GET | /api/hydration?date=DATE | Get water count |
| POST | /api/hydration/increment | Add one glass |
| GET | /api/holidays?year=2026 | Get holidays |
