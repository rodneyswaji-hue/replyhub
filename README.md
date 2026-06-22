# ReplyHub

Real-time customer support chat & ticketing platform.

## Architecture

```
replyhub/
├── backend/     Laravel 11 API + WebSockets (Reverb)
├── frontend/    Next.js 16 + Mantine agent dashboard
└── widget/      Embeddable chat widget (Vite + TypeScript)
```

## Quick start (local dev)

### Prerequisites
- PHP 8.3+, Composer 2
- Node 20+, npm
- PostgreSQL 15+

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env — set DB_PASSWORD etc.
composer install
php artisan migrate
php artisan db:seed   # optional demo data

# In 3 separate terminals:
php artisan serve                        # API on :8000
php artisan reverb:start                 # WebSocket on :8080
php artisan queue:work                   # Background jobs
```

### 2. Frontend

```bash
cd frontend
cp .env.local.example .env.local         # or edit .env.local directly
npm install
npm run dev                              # Dashboard on :3000
```

### 3. Widget (development)

```bash
cd widget
npm install
npm run dev                              # Dev server on :5173
# or
npm run build                            # Outputs dist/widget.iife.js
```

## Embedding the widget

After signing up and copying your API key from **Settings → Widget**:

```html
<script>
  window.ReplyHubConfig = {
    apiKey: "rh_YOUR_API_KEY_HERE",
  };
</script>
<script src="https://your-widget-host/widget.iife.js" async></script>
```

The widget auto-detects the visitor's browser/OS, creates an anonymous session, and
connects to your workspace via WebSocket. If no agents are online, the conversation
is automatically saved as a ticket.

## Features

- **Real-time messaging** via Laravel Reverb + Laravel Echo (WebSockets, no polling)
- **Typing indicators** — both agents and visitors see "...is typing"
- **Agent presence** — online/away/offline with presence channels
- **Chat → Ticket** — auto-conversion when no agents online
- **Ticket status** — open / pending / resolved / closed
- **Priority & assignment** per conversation
- **Canned responses** with `/shortcut` insertion
- **Visitor intelligence** — page URL, browser, OS, country
- **CSAT ratings** — post-chat satisfaction scoring
- **Analytics dashboard** — volume, response times, agent performance
- **Labels** — color-coded conversation tags
- **Internal notes** — private agent messages per conversation
- **Multi-workspace SaaS** — each business is fully isolated

## Environment variables

### Backend (`backend/.env`)
| Variable | Description |
|---|---|
| `DB_*` | PostgreSQL credentials |
| `REVERB_APP_KEY/SECRET/ID` | Reverb authentication |
| `REVERB_HOST/PORT` | Where Reverb listens |
| `FRONTEND_URL` | CORS allow-origin for dashboard |

### Frontend (`frontend/.env.local`)
| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API base URL |
| `NEXT_PUBLIC_REVERB_APP_KEY` | Must match backend `REVERB_APP_KEY` |
| `NEXT_PUBLIC_REVERB_HOST/PORT/SCHEME` | WebSocket connection info |

## Tech stack

| Layer | Technology |
|---|---|
| Backend API | Laravel 11, PHP 8.3 |
| Real-time | Laravel Reverb (WebSockets) |
| Auth | Laravel Sanctum (Bearer tokens) |
| Database | PostgreSQL 16 |
| Queue | Laravel queue (database driver) |
| Dashboard | Next.js 16, TypeScript, Mantine v7 |
| State | Zustand + TanStack Query |
| Widget | Vite + TypeScript (IIFE bundle, ~87KB gzipped 25KB) |
