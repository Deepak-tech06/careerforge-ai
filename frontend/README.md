# CareerForge AI — Frontend

The Next.js frontend for CareerForge AI — a multi-page application providing the user interface for resume upload, career analysis, skill gap review, and learning roadmap navigation.

---

## Technology

- **Next.js 16** (App Router)
- **React 19** + **TypeScript**
- **Tailwind CSS v4**
- **Axios** — REST API client with JWT interceptors
- **Recharts** — data visualisation charts
- **React Dropzone** — drag-and-drop file upload
- **Inter** font (Google Fonts)

---

## Pages

| Route | Description |
|---|---|
| `/` | Landing page — features, how it works, stats |
| `/auth` | Login and registration |
| `/dashboard` | Overview — readiness score, matched/missing skills |
| `/dashboard/upload` | PDF resume upload and role selection |
| `/dashboard/analysis` | Detailed analysis results |
| `/dashboard/roadmap` | Step-by-step learning roadmap |
| `/dashboard/jobs` | Job role match overview |
| `/dashboard/interview` | Interview preparation questions |

---

## Installation

```bash
cd frontend
npm install
```

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001/api` | Backend API base URL |

---

## Development

```bash
npm run dev
```

Opens at [http://localhost:3000](http://localhost:3000)

---

## Production Build

```bash
npm run build
npm run start
```

---

## Lint

```bash
npm run lint
```

---

## Important Configuration

- **`next.config.ts`** — Next.js configuration
- **`postcss.config.mjs`** — PostCSS / Tailwind CSS v4 setup
- **`tsconfig.json`** — TypeScript configuration
- **`app/globals.css`** — global CSS variables and theme definitions

### Authentication

JWT tokens are stored in `localStorage` under keys `cf_token` and `cf_user`.
- `lib/api.ts` — Axios instance that automatically attaches the `Authorization: Bearer` header and handles 401 responses by clearing local auth state and redirecting to `/auth`
- `lib/auth.ts` — helpers for reading/writing auth state in `localStorage`

### Themes

`components/ThemeProvider.tsx` provides a global theme context. Theme switching is available to admin users only (role assigned server-side).

---

## Docker

Built and served via the root `docker-compose.yml`. See the [root README](../README.md) for Docker setup instructions.
