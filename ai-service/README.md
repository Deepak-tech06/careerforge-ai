# CareerForge AI — AI Service

The Python/FastAPI microservice that performs skill extraction, career readiness scoring, and learning roadmap generation for CareerForge AI.

The backend communicates with this service via HTTP. If this service is unreachable, the backend automatically falls back to an equivalent local algorithm — the application continues to function without this service running.

---

## Technology

- **Python 3.10+**
- **FastAPI 0.115**
- **Uvicorn 0.30** (ASGI server)
- **Pydantic v2** (request/response validation)

No external AI APIs are used. All analysis is performed locally by a custom NLP engine.

---

## Installation

```bash
cd ai-service
pip install -r requirements.txt
```

---

## Environment Variables

No environment variables are required for this service. It listens on all interfaces at port `8000` by default.

---

## Running

```bash
# Development (with auto-reload)
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Production
uvicorn main:app --host 0.0.0.0 --port 8000
```

Service available at [http://localhost:8000](http://localhost:8000)

---

## Endpoints

### `GET /health`

Health check. Returns service status.

**Response:**
```json
{
  "status": "ok",
  "service": "CareerForge AI"
}
```

---

### `POST /analyze`

Performs skill gap analysis and generates a learning roadmap.

**Request body:**
```json
{
  "resume_text": "string — full extracted text of the resume",
  "extracted_skills": ["string", "..."],
  "target_role": "string — e.g. 'Full Stack Developer'"
}
```

**Response:**
```json
{
  "readiness_score": 72.0,
  "matched_skills": ["react", "typescript", "docker"],
  "skill_gaps": ["kubernetes", "aws"],
  "roadmap": [
    {
      "step": 1,
      "skill": "Kubernetes",
      "title": "Master Kubernetes",
      "description": "...",
      "priority": "high",
      "completed": false,
      "duration": "2 weeks",
      "resources": [
        { "name": "...", "url": "...", "type": "Free" }
      ]
    }
  ]
}
```

---

## How It Works

1. **Skill extraction** — scans `resume_text` against a dictionary of 30+ technology keywords using flexible regex patterns (handles spacing variants, dots, hyphens)

2. **Skill normalisation** — maps aliases to canonical forms (`js` → `javascript`, `postgres` → `postgresql`, etc.)

3. **Role matching** — compares extracted skills against a role requirements database for 8 roles: Frontend Developer, Backend Developer, Full Stack Developer, Data Scientist, DevOps Engineer, ML Engineer, Mobile Developer, Cloud Engineer

4. **Readiness scoring** — `floor((matched / total_required) * 100)`

5. **Roadmap generation** — for each skill gap, generates a learning step with priority level and resource links

---

## Fallback Behaviour

The backend (`backend/src/analysis/analysis.service.ts`) implements the same skill matching and roadmap generation algorithm locally. If this service returns an error or is unreachable, the backend logs a warning and uses the fallback — the user sees no failure.

---

## Docker

Built and served via the root `docker-compose.yml` as the `ai-service` container. See the [root README](../README.md) for full setup instructions.
