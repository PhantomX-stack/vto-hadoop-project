from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    ANTHROPIC_API_KEY: str = ""
    APP_ENV: str = "development"

    class Config:
        env_file = ".env"

settings = Settings()
