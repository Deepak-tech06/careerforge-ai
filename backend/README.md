# CareerForge AI — Backend

The NestJS REST API server for CareerForge AI. Handles authentication, PDF resume processing, career analysis orchestration, and persistent storage via Prisma and PostgreSQL.

---

## Technology

- **NestJS 11** — modular Node.js framework
- **TypeScript**
- **Prisma 7** — ORM and migration toolkit
- **PostgreSQL 15** — relational database
- **passport-jwt** + **bcryptjs** — JWT authentication and password hashing
- **pdf-parse** — PDF text extraction
- **multer** — multipart form-data file upload
- **class-validator** + **class-transformer** — DTO validation

---

## Modules

| Module | Responsibility |
|---|---|
| `AuthModule` | Registration, login, JWT signing, Passport strategy |
| `ResumeModule` | PDF upload, text extraction, skill keyword extraction |
| `AnalysisModule` | Career analysis, AI service communication, fallback, roadmap |
| `PrismaModule` | Database connection and service |

---

## Installation

```bash
cd backend
npm install
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `DIRECT_URL` | ✅ | Direct connection for Prisma migrations |
| `JWT_SECRET` | ✅ | JWT signing secret (min 64 characters) |
| `PORT` | Optional | Server port (default: `3001`) |
| `AI_SERVICE_URL` | Optional | AI service URL (default: `http://localhost:8000`) |
| `FRONTEND_URL` | Optional | Frontend URL for CORS (default: `http://localhost:3000`) |
| `ADMIN_EMAIL` | Optional | Email that receives ADMIN role on registration |

**Generate secure values:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"  # DB password
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"  # JWT secret
```

---

## Database Setup

### Prerequisites
- PostgreSQL 15 running locally (or via Docker)
- `DATABASE_URL` set in `backend/.env`

### Create the database (if it doesn't exist)
```bash
psql -U postgres -c "CREATE DATABASE careerforge;"
```

### Run migrations
```bash
# Development (creates migration files if schema changed)
npx prisma migrate dev

# Production / CI (applies existing migrations only)
npx prisma migrate deploy
```

### Generate Prisma client
```bash
npx prisma generate
```

### Inspect the database (optional)
```bash
npx prisma studio
```

---

## Database Schema

Four models with the following relationships:

```
User (1) ──► (many) Resume (1) ──► (many) Analysis (1) ──► (one) Roadmap
```

| Model | Key Fields |
|---|---|
| `User` | `id`, `name`, `email` (unique), `password` (bcrypt), `role` |
| `Resume` | `id`, `userId`, `fileName`, `rawText`, `parsedSkills[]` |
| `Analysis` | `id`, `resumeId`, `targetRole`, `readinessScore`, `matchedSkills[]`, `skillGaps[]` |
| `Roadmap` | `id`, `analysisId`, `steps` (JSON) |

---

## Development

```bash
npm run start:dev
```

API available at [http://localhost:3001/api](http://localhost:3001/api)

---

## Production Build

```bash
npm run build
npm run start:prod
```

---

## API Routes

All routes are prefixed with `/api`. Protected routes require `Authorization: Bearer <token>`.

### Auth

| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new user |
| `POST` | `/api/auth/login` | Public | Login, returns JWT |

### Resume

| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/api/resume/upload` | JWT | Upload PDF (multipart `file` field) |
| `GET` | `/api/resume/my` | JWT | Get current user's resumes |
| `GET` | `/api/resume/:id` | JWT | Get specific resume |

### Analysis

| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/api/analysis` | JWT | Run analysis (`resumeId`, `targetRole`) |
| `GET` | `/api/analysis/my` | JWT | Get current user's analyses |
| `GET` | `/api/analysis/roles` | JWT | Get available target roles |
| `GET` | `/api/analysis/:id` | JWT | Get specific analysis |

---

## Testing

```bash
# Unit tests
npm test

# Unit tests with coverage
npm run test:cov

# End-to-end tests
npm run test:e2e
```

---

## Docker

Built and served via the root `docker-compose.yml`. Migrations run automatically on container start. See the [root README](../README.md) for full setup instructions.
