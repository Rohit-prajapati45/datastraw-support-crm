# Datastraw SupportDesk CRM

A customer-support ticketing CRM built with React, Vite, Tailwind CSS, Express, and SQLite. Ticket data and notes are stored in SQLite, which is initialized automatically on backend startup.

## Install

From the project root:

```powershell
npm install
npm install --prefix backend
npm install --prefix frontend
```

## Configure AI summaries (optional)

Copy `.env.example` to `backend/.env` and provide a Gemini API key. The rest of the CRM works without this file.

```powershell
Copy-Item .env.example backend\.env
```

Set `GEMINI_API_KEY` in `backend/.env`. `GEMINI_MODEL` is optional and defaults to `gemini-2.5-flash`.

## Run

In one terminal:

```powershell
npm run dev --prefix backend
```

In a second terminal:

```powershell
npm run dev --prefix frontend
```

Open `http://localhost:5173`. The frontend proxies API requests to `http://localhost:5000`.

## API

- `POST /api/tickets` creates an Open ticket.
- `GET /api/tickets?search=value&status=Open` lists searched/filtered tickets.
- `GET /api/tickets/:ticket_id` returns a ticket and its notes.
- `PUT /api/tickets/:ticket_id` changes status and/or saves a note.
- `POST /api/tickets/:ticket_id/summary` generates the optional AI summary.

## Production deployment

### Railway backend

Deploy the `backend` directory as a Railway service. Use `npm install` as the build command and `npm start` as the start command. Railway provides `PORT` automatically and the server listens on it.

Set these Railway variables:

- `GEMINI_API_KEY` — required only for AI summaries; keep it on Railway only.
- `GEMINI_MODEL=gemini-2.5-flash` — optional.
- `CORS_ORIGIN=https://your-render-site.onrender.com` — the exact Render frontend URL. Multiple origins can be comma-separated.
- `SQLITE_DB_PATH=/data/support-crm.db` — attach a Railway Volume mounted at `/data` so ticket data persists across deployments.

### Render frontend

Deploy the `frontend` directory as a Render Static Site. Use `npm install && npm run build` as the build command and `dist` as the publish directory.

Set this Render build-time environment variable:

- `VITE_API_URL=https://your-backend.up.railway.app`

When `VITE_API_URL` is unset locally, the frontend continues to use Vite's local `/api` proxy. Never put `GEMINI_API_KEY` in a frontend environment variable.
