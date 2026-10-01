# AGENTS.md - projeto-extensao-frontend

## Project Overview
React 19 + Vite 8 SPA for "Arandu Digital" (Clube de Desbravadores Tamoios). Consumes a Spring Boot backend API.

## Key Commands (run from `projeto-tamoios/`)
```bash
npm run dev       # Start dev server (port 5173, proxies /api to localhost:8080)
npm run build     # Production build to dist/
npm run lint      # ESLint (flat config, ignores dist/)
npm run preview   # Preview production build
```

## Environment
- Node 22+ (Docker uses node:22-slim)
- NPM 11+
- `.env` (dev): `VITE_API_URL=/api`, `VITE_PROXY_TARGET=http://localhost:8080`
- `.env.production`: `VITE_API_URL=` (empty - ALB routes directly to backend)

## Architecture
```
projeto-tamoios/
├── src/
│   ├── main.jsx          # Entry: mounts App, loads VLibras, Fredoka font
│   ├── App.jsx           # Routes (react-router-dom v7)
│   ├── pages/            # Page components (Login, Dashboard, Desbravadores, etc.)
│   ├── components/       # Reusable components (Modal, ProtectedRoute, etc.)
│   ├── services/         # API layer (axios instance + interceptors)
│   ├── hooks/            # Custom hooks (useCatalogos)
│   ├── styles/           # CSS Modules (one per component/page)
│   └── assets/           # Static assets
├── vite.config.js        # Dev proxy for /api -> backend
├── eslint.config.js      # Flat config: recommended + react-hooks + react-refresh
└── Dockerfile            # Multi-stage: node:22-slim build -> nginx:alpine
```

## API Client (`src/services/api.js`)
- Axios instance with `baseURL: import.meta.env.VITE_API_URL`
- Request interceptor: attaches `Bearer <token>` from localStorage (except public routes `/usuarios/login`, `/auth`)
- Response interceptor: on 401 (non-public routes) clears token/usuario and redirects to `/` via `window.location.replace`

## Auth Flow
- Protected routes wrapped in `<ProtectedRoute>` (checks localStorage token)
- Login at `/`, all dashboard routes require auth
- Token stored in localStorage as `token`, user data as `usuario`

## CI/CD
- **Gitleaks** (`.github/workflows/gitleaks.yml`): Runs on push/PR, scans new commits only
- **Docker Build** (`.github/workflows/docker-build.yml`): On push to main, builds/pushes `pedrobarbosa996/arandu_digital:frontend` from `./projeto-tamoios`

## Development Gotchas
1. **Proxy config**: Dev server proxies `/api` to `VITE_PROXY_TARGET` (default localhost:8080). Backend must be running.
2. **Production API URL**: Empty string in `.env.production` because ALB handles routing. Do not hardcode `/api`.
3. **VLibras**: Loaded dynamically in `main.jsx` for accessibility.
4. **CSS Modules**: All styles use `.module.css` naming convention.
5. **No tests configured**: No test script in package.json.

## Key Files to Reference
- `projeto-tamoios/src/services/api.js` - API client with auth interceptors
- `projeto-tamoios/vite.config.js` - Dev proxy configuration
- `projeto-tamoios/.env` / `.env.production` - Environment variables
- `projeto-tamoios/Dockerfile` - Production build process