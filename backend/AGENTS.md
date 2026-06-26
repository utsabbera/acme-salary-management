# Backend AGENTS.md

FastAPI 0.138, Python 3.13, SQLAlchemy 2, Alembic, uv.

## Commands

```bash
cd backend && uv run fastapi dev main.py   # dev server
cd backend && uv run pytest                # all tests
cd backend && uv run pytest tests/unit/    # unit tests only (no DB)
cd backend && uv run mypy app/             # type check
cd backend && uv run ruff check app/       # lint
cd backend && uv run ruff format app/      # format
cd backend && uv run alembic upgrade head  # apply migrations
```

## Architecture

Strict layer order — never skip or cross layers:

```
router → service → repository → SQLAlchemy session (DbDep)
```

- **Routers** (`app/routers/`): validate input, call one service method, return schema
- **Services** (`app/services/`): business logic — raise `HTTPException` here
- **Repositories** (`app/repositories/`): async DB access — return `None` on not-found, never raise
- **Models** (`app/models/`): SQLAlchemy ORM — import each into `models/__init__.py`
- **Schemas** (`app/schemas/`): Pydantic — `{Name}Create`, `{Name}Update`, `{Name}Read`

## Key Patterns

**DI alias** — always use `DbDep`, never raw `Depends(get_db)`:
```python
from app.core.deps import DbDep

@router.get("/items")
async def list_items(db: DbDep) -> list[ItemRead]: ...
```

**App factory** — use `create_app()`, never import `app` directly in tests:
```python
app = create_app()
app.dependency_overrides[get_db] = lambda: db_session
```

**Config list fields** — JSON array syntax in `.env`:
```
CORS_ORIGINS=["http://localhost:3000","https://example.com"]
```

## Tests

- `tests/unit/` — no DB, no HTTP, fast
- `tests/integration/` — full HTTP via `AsyncClient` + DI override, in-memory SQLite
- Fixtures in `tests/conftest.py`: `test_engine` (session-scoped), `db_session`, `client`
- Rollback after each test provides isolation — no truncation needed

## Adding a Backend Feature

For a new resource (e.g. `post`):

1. `app/models/post.py` — SQLAlchemy model extending `Base`
2. Add import to `app/models/__init__.py`
3. `app/schemas/post.py` — `PostCreate`, `PostUpdate`, `PostRead`
4. `app/repositories/post.py` — async CRUD, return `None` on not-found
5. `app/services/post.py` — business logic, raise `HTTPException`
6. `app/routers/post.py` — route handlers using `DbDep`
7. Register router in `main.py` `create_app()`
8. `make db-migrate MSG="add posts table"`

## Key Files

| File | Purpose |
|---|---|
| `main.py` | `create_app()` factory — entry point |
| `app/core/config.py` | All env vars via pydantic-settings |
| `app/core/database.py` | Async engine, `Base`, `get_db()` |
| `app/core/deps.py` | `DbDep` DI alias |
| `openapi.json` | Committed spec — source of truth for TS codegen |
| `alembic/env.py` | Async migrations wired to `settings.database_url` |
