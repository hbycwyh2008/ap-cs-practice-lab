# Frontend Style Troubleshooting

## Symptom

The app renders as raw HTML:

- Navbar looks unstyled
- Buttons look like plain links
- Layout spacing is missing
- Text appears concatenated because CSS layout is not applied

## Likely Cause

Tailwind/global CSS is not being loaded at runtime. In Docker dev mode, stale `.next` cache or stale `node_modules` volume state can cause this.

## Quick Checks

1. Check frontend logs:

```bash
docker compose logs frontend --tail=200
```

Look for Tailwind/PostCSS/Next CSS compile errors.

2. Verify required files exist inside the frontend container:

```bash
docker compose exec frontend sh -lc "test -f src/app/globals.css && echo globals-ok"
docker compose exec frontend sh -lc "test -f tailwind.config.ts && echo tailwind-config-ok"
docker compose exec frontend sh -lc "test -f postcss.config.js && echo postcss-ok"
docker compose exec frontend sh -lc "npm ls tailwindcss postcss autoprefixer"
```

3. Verify CSS asset response:

- Open browser Network tab
- Filter by `CSS`
- Check `/_next/static/css/...` returns `200`
- Confirm `Content-Type: text/css`

## Rebuild / Reset Commands

Use this sequence if styles are broken:

```bash
docker compose down
docker compose up --build -d
```

If still broken, reset frontend cache and rebuild:

```bash
docker compose down
docker compose build --no-cache frontend
docker compose up -d frontend
```

If volume state is stale, reset all volumes:

```bash
docker compose down -v
docker compose build --no-cache frontend
docker compose up -d
```

## Config Expectations

- `frontend/src/app/layout.tsx` imports `./globals.css`
- `frontend/src/app/globals.css` includes:
  - `@tailwind base;`
  - `@tailwind components;`
  - `@tailwind utilities;`
- `frontend/postcss.config.js` includes `tailwindcss` and `autoprefixer`
- `frontend/tailwind.config.ts` content globs include `./src/**/*.{ts,tsx}`

## Final Validation Checklist

- Homepage is styled
- Navbar is horizontal and styled
- Buttons render with shadcn/Tailwind styles
- Cards show spacing, borders, and layout
- Dashboard pages and question pages are styled
- `npm run build` succeeds
- Smoke test succeeds
