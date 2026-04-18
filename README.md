# AlgoCoach

AlgoCoach is an AI powered coding interview preparation platform that helps users practice DSA problems, simulate real interviews, and receive intelligent feedback to improve their problem-solving and communication skills.

## Local Development

This repo does not require a local Supabase stack to run.

The backend uses `DATABASE_URL` from `backend/.env` and falls back to a local SQLite file when that variable is not set. If you see tooling complain about `supabase start`, that is coming from external Supabase tooling rather than the app itself.

1. Start the FastAPI backend from `backend/`.
2. Start the Vite frontend from `frontend/`.

### Groq AI Hints Setup

To enable AI-powered hints in the code editor, set these variables in `backend/.env`:

```env
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
```

If `GROQ_API_KEY` is missing or the provider is unavailable, the backend safely falls back to built-in language-specific hints.

### Run Example

From `backend/`:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

From `frontend/` (if backend runs on 8001):

```env
VITE_PYTHON_API_URL=http://127.0.0.1:8001
```
