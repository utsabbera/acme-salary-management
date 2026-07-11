from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    app_name: str = "ACME Salary Management"
    debug: bool = True
    database_url: str = "postgresql+asyncpg://postgres:password@localhost:5432/acme_salary"
    cors_origins: list[str] = ["http://localhost:3000"]
    port: int = 8000


settings = Settings()
