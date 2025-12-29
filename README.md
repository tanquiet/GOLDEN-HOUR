# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

# GOLDENHOUR

GOLDENHOUR is a Vite + React + TypeScript starter with shadcn-ui components, Tailwind CSS, and Supabase integration.

## Quick start

Install dependencies:

```bash
npm ci
```

Run locally:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Typecheck (CI):

```bash
npm run typecheck
```

Format code:

```bash
npm run format
```

Lint:

```bash
npm run lint
```

Preview production build:

```bash
npm run preview
```

## Environment

This project uses Supabase for auth and storage. Create a `.env` file in the project root with the following variables (example):

```
VITE_SUPABASE_URL=https://xyz.supabase.co
VITE_SUPABASE_ANON_KEY=public-anon-key
```

Never commit secrets.

## Deployment

Recommended providers: Vercel, Netlify, or any static host that supports SPAs.

Vercel:
- Create a new project and import the repo.
- Set build command: `npm run build` and output directory: `dist`.
- Add environment variables (see Environment above).

Netlify:
- Create a new site from Git, set build command `npm run build` and publish directory `dist`.
- Add environment variables in site settings.
- A sample `netlify.toml` is included.

## Production checklist

- [ ] Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set in production env.
- [ ] Run `npm run typecheck && npm run build` locally before releasing.
- [ ] Run accessibility checks (axe, Lighthouse).
- [ ] Verify responsive UX across devices.
- [ ] Update `version` in `package.json` for releases and tag Git.

## CI

A GitHub Actions workflow is included at `.github/workflows/ci.yml` that runs lint, typecheck, and build.

## Notes

- To reduce initial bundle size, enable route-based code-splitting with dynamic `import()` for large pages.
- Customize `vite.config.ts` `build.rollupOptions.manualChunks` for advanced chunking.
