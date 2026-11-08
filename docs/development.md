# CareerForge AI — Local Development Guide

This guide covers everything needed to run CareerForge AI locally from scratch.

---

## Prerequisites

| Tool | Minimum Version | Purpose |
|---|---|---|
| Node.js | 20.x | Backend and frontend |
| npm | 10.x | Package management |
| Python | 3.10 | AI service |
| pip | Latest | Python packages |
| PostgreSQL | 15 | Database |
| Docker (optional) | Latest | Full stack via Compose |

---

## 1. Clone the Repository

```bash
git clone https://github.com/Deepak-tech06/careerforge-ai.git
cd careerforge-ai
```

---

## 2. Environment Configuration

### Backend

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` and fill in real values:

```env
DATABASE_URL=postgresql://postgres:YOUR_PG_PASSWORD@localhost:5432/careerforge
DIRECT_URL=postgresql://postgres:YOUR_PG_PASSWORD@localhost:5432/careerforge
JWT_SECRET=YOUR_64_CHAR_RANDOM_SECRET
PORT=3001
AI_SERVICE_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
# ADMIN_EMAIL=your_email_here   # uncomment to enable admin account
```

**Generate secure values:**
```bash
# PostgreSQL password (64 hex chars)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# JWT secret (128 hex chars)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Frontend

```bash
cp frontend/.env.example frontend/.env.local
```

The default `NEXT_PUBLIC_API_URL=http://localhost:3001/api` works for local development. No changes needed unless your backend runs on a different port.

---

## 3. Database Setup

### Create the PostgreSQL database

If you don't have PostgreSQL running locally, start it first (or use Docker — see below).

```bash
psql -U postgres -c "CREATE DATABASE careerforge;"
```

### Install backend dependencies

```bash
cd backend
npm install
```

### Generate Prisma client and run migrations

```bash
npx prisma generate
npx prisma migrate dev
```

`migrate dev` creates the 4 tables (`User`, `Resume`, `Analysis`, `Roadmap`) and all indexes.

### Verify the schema (optional)

```bash
npx prisma migrate status
npx prisma studio    # Opens a browser GUI at http://localhost:5555
```

---

## 4. Running the AI Service

```bash
cd ai-service
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Verify: [http://localhost:8000/health](http://localhost:8000/health) should return `{"status":"ok","service":"CareerForge AI"}`

> **Note:** The backend has a built-in fallback if this service is unavailable. You can skip this step and the application will still work.

---

## 5. Running the Backend

```bash
cd backend
npm run start:dev
```

Verify: [http://localhost:3001/api](http://localhost:3001/api) should respond.

---

## 6. Running the Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Running with Docker Compose

Docker Compose starts all four services (PostgreSQL, AI service, Backend, Frontend) together.

```bash
# 1. Configure the root .env
cp .env.example .env
# Edit .env with your credentials

# 2. Validate the config (no credentials should appear inline)
docker compose config

# 3. Build and start
docker compose up --build

# 4. Run in background
docker compose up --build -d

# 5. View logs
docker compose logs -f

# 6. Stop
docker compose down

# 7. Stop and remove volumes (resets database)
docker compose down -v
```

---

## Prisma Commands Reference

```bash
# Generate client after schema changes
npx prisma generate

# Create and apply a new migration (local dev)
npx prisma migrate dev --name describe_your_change

# Apply existing migrations (CI/production)
npx prisma migrate deploy

# Check migration status
npx prisma migrate status

# Reset the database (drops all data — development only)
npx prisma migrate reset

# Open Prisma Studio (database GUI)
npx prisma studio
```

---

## Testing

```bash
# Backend unit tests
cd backend
npm test

# Backend unit tests with coverage report
npm run test:cov

# Backend end-to-end tests
npm run test:e2e

# Frontend lint
cd frontend
npm run lint

# Frontend production build (validates TypeScript and Next.js compilation)
npm run build
```

---

## Troubleshooting

### Backend fails to start — "DATABASE_URL is not set"
Ensure `backend/.env` exists and contains a valid `DATABASE_URL`. The application no longer falls back to any default value.

### Backend fails to start — "JWT_SECRET is not set"
Ensure `backend/.env` contains `JWT_SECRET`. Generate one with:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Prisma migration error — "connection refused"
PostgreSQL is not running. Start it, or use `docker compose up db` to start only the database.

### AI service not reachable
The backend will log a warning and use the fallback algorithm. Analysis will still complete. Check that the AI service is running on port `8000`.

### Frontend — API calls fail with CORS error
Ensure `FRONTEND_URL` in `backend/.env` matches the actual frontend URL (e.g., `http://localhost:3000`).

### Port conflicts
Default ports: `3000` (frontend), `3001` (backend), `5432` (PostgreSQL), `8000` (AI service). Change them in `.env` and restart services if there are conflicts.

---

## Project Scripts Reference

### Backend (`backend/package.json`)

| Script | Command | Description |
|---|---|---|
| `start:dev` | `nest start --watch` | Development server with auto-reload |
| `start:prod` | `node dist/main` | Production server |
| `build` | `nest build` | Compile TypeScript |
| `test` | `jest` | Unit tests |
| `test:e2e` | `jest --config ./test/jest-e2e.json` | E2E tests |
| `test:cov` | `jest --coverage` | Coverage report |
| `lint` | `eslint ... --fix` | Lint and auto-fix |

### Frontend (`frontend/package.json`)

| Script | Command | Description |
|---|---|---|
| `dev` | `next dev` | Development server |
| `build` | `next build` | Production build |
| `start` | `next start` | Serve production build |
| `lint` | `eslint` | Lint check |
