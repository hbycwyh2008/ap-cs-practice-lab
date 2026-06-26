from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://apcs:apcs_secret@localhost:5432/ap_cs_practice"
    secret_key: str = "dev-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24

    app_env: str = "development"
    enable_public_register: bool = False
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"

    java_runner_image: str = "ap-cs-java-runner"
    java_runner_memory: str = "256m"
    java_runner_cpus: str = "0.5"
    java_runner_timeout: int = 5
    java_runner_pids_limit: int = 64
    java_runner_tmp_dir: str = "/tmp/ap-cs-practice-lab-java-runs"

    class Config:
        env_file = ".env"


settings = Settings()

# Production safety check
if settings.app_env == "production" and settings.secret_key == "dev-secret-key-change-in-production":
    raise ValueError("SECRET_KEY must be changed in production")
