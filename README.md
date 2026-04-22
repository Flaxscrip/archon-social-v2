# archon.social

Frontend for [archon.social](https://archon.social) — a decentralized name service built on the [Archon Protocol](https://archon.technology).

Claim your `@name`, get a W3C Verifiable Credential, a Lightning Address (LUD-16), and a public DID identity — no email, no passwords, no gatekeepers.

## Architecture

This is a standalone React frontend (Vite + TypeScript + MUI) that talks to a **Herald** backend via its REST API. The frontend handles:

- **Home** — public landing, directory, AI agent quick start
- **Login** — QR challenge via Archon Wallet
- **Profile** — name claim/management, DID display
- **Credential** — W3C VC viewer with QR code
- **Members** — authenticated directory
- **Owner** — admin panel (IPNS publish)
- **`/agents.html`** — static page for AI agent onboarding

The Herald server is deployed separately (same pattern as 4tress.org). **No PR needed back to the Herald client repo** — this is an independent frontend.

## Dev Setup

```bash
npm install
cp .env.example .env        # adjust if needed
npm run dev                  # starts on http://localhost:4000
```

The dev server proxies `/api/*` → `http://flaxlap.local:4222/names/api/*` (Herald via Drawbridge).

## Production Build

```bash
npm run build                # outputs to ./build/
npm run preview              # preview the build locally
```

Set `VITE_API_URL` in `.env.production` to point at the production Herald API.

## Environment Variables

| Variable | Dev Default | Production |
|---|---|---|
| `VITE_API_URL` | `/api` (proxied) | `https://archon.social/names/api` |
| `VITE_PORT` | `4000` | — |
| `VITE_API_PROXY_TARGET` | `http://flaxlap.local:4222` | — |

## Project Structure

```
src/
  api.ts              — Axios instance (baseURL from env)
  App.tsx             — Router + AppProvider
  contexts/AppContext  — Global state (config, auth, directory)
  components/Layout   — Header, LoadingShell, buildWalletUrl
  views/
    Home              — Landing page (unauth: hero + directory; auth: dashboard)
    ViewLogin         — QR challenge login
    ViewLogout         — Session clear + redirect
    ViewProfile       — Name claim/delete, DID info
    ViewCredential    — VC viewer with QR
    ViewMembers       — Authenticated directory
    ViewMember        — Public member detail (DID doc, QR)
    ViewOwner         — Admin panel (IPNS publish)
public/
  agents.html         — Static AI agent quick start
```