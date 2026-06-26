# Frontend AGENTS.md

Next.js 16, React 19, TypeScript 6, Tailwind CSS 4, Biome, Vitest.

## Commands

```bash
cd frontend && pnpm dev           # dev server :3000
cd frontend && pnpm build         # production build
cd frontend && pnpm tsc --noEmit  # type check
cd frontend && pnpm vitest run    # tests
cd frontend && pnpm openapi-ts    # regenerate TS client (prefer: make gen-client)
```

## Codegen Bridge

The TypeScript API client is generated from `backend/openapi.json` — never written by hand.

```
backend/openapi.json  →  make gen-client  →  src/lib/generated/
```

- Never edit `src/lib/generated/` — any change will be overwritten on next regeneration
- Run `make gen-client` after any FastAPI route, schema, or response model change
- The generated files are committed — schema drift shows as a visible diff in PRs
- Client is configured in `src/lib/api.ts`; import generated functions from `@/lib/generated`

## Structure

```
src/
  app/              Next.js App Router — file-system routing
  components/ui/    Owned UI components (shadcn-style, not a package)
  lib/
    api.ts          hey-api client setup (base URL, auth headers)
    generated/      openapi-ts output — never hand-edit
```

## Adding a Frontend Feature

After adding a backend route and running `make gen-client`:

1. `src/app/<feature>/page.tsx` — route page
2. Import generated types and service functions from `@/lib/generated`
3. Use the configured client from `@/lib/api.ts`

## Key Conventions

- `@/*` path alias resolves to `src/` — use it everywhere, no relative `../../` imports
- `noUncheckedIndexedAccess` is enabled — array/object access returns `T | undefined`
- App Router only — no `pages/` directory
- `typedRoutes` experimental flag is on — `<Link href="">` is type-checked against actual routes
