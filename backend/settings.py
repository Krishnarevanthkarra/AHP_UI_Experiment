from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    MONGO_URI: str
    MONGO_USERNAME: str
    MONGO_PASSWORD: str
    MONGO_CLUSTER: str
    DB_NAME: str
    FRONTEND: str

    class Config:
        env_file = ".env"


settings = Settings()
