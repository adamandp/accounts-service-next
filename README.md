# Accounts Service FE

Next.js App Router frontend for the standalone Accounts Service (Rust/Axum). Uses shadcn/ui, TanStack Query and a browser-memory access token. No mock data or credentials are included.

## Development

1. Copy .env.example to .env.local if overriding the default API URL.
2. Start Accounts Service at http://localhost:3000.
3. Run npm install and npm run dev.
4. Open http://localhost:3001.

The backend must allow http://localhost:3001 in FRONTEND_ORIGINS and configure OAUTH_FRONTEND_REDIRECT_URI=http://localhost:3001/auth/callback. Production requires HTTPS and a cookie-compatible deployment (same-site frontend/API or suitable backend cookie configuration). Configure OAuth providers in the backend.

## Security

Frontend permissions are presentation/route guards only; the backend enforces authorization. Access tokens remain in memory, refresh uses HttpOnly cookies, and refresh calls are serialized. Login, logout and password changes clear the query cache. No sensitive data should be stored in environment variables prefixed NEXT_PUBLIC_.

## Checks

npm run lint
npm run typecheck
npm run build
