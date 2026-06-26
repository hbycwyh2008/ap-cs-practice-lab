from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://apcs:apcs_secret@localhost:5432/ap_cs_practice"
    secret_key: str = "dev-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24

    java_runner_image: str = "ap-cs-java-runner"
    java_runner_memory: str = "256m"
    java_runner_cpus: str = "0.5"
    java_runner_timeout: int = 5
    java_runner_pids_limit: int = 64
    java_runner_tmp_dir: str = "/tmp/ap-cs-practice-lab-java-runs"

    class Config:
        env_file = ".env"


settings = Settings()
