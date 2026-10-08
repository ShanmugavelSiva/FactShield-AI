"""Application configuration using Pydantic Settings."""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    mongodb_url: str = "mongodb://localhost:27017"
    database_name: str = "factshield"
    secret_key: str = "change-this-secret-key-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    frontend_url: str = "http://localhost:5173"
    ml_model_path: str = "../ml_model/model"
    rate_limit: str = "60/minute"

    @property
    def cors_origins(self) -> List[str]:
        return [
            self.frontend_url,
            "http://localhost:5173",
            "http://127.0.0.1:5173",
        ]

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
