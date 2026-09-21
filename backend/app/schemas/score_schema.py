import re
from datetime import datetime

from pydantic import BaseModel, Field, field_validator

ALIAS_PATTERN = re.compile(r"^[A-Za-z0-9 _-]+$")


class ScoreCreate(BaseModel):
    player_alias: str = Field(..., min_length=1, max_length=40)
    score: int = Field(..., ge=0)
    level: int = Field(..., ge=1)

    @field_validator("player_alias")
    @classmethod
    def validate_alias(cls, value: str) -> str:
        alias = value.strip()
        if len(alias) < 3:
            raise ValueError("El alias debe tener al menos 3 caracteres.")
        if len(alias) > 20:
            raise ValueError("El alias no puede superar 20 caracteres.")
        if not ALIAS_PATTERN.match(alias):
            raise ValueError("Usa letras, números, espacios, guion o guion bajo.")
        return alias


class ScoreRead(BaseModel):
    id: int
    player_alias: str
    score: int
    level: int
    created_at: datetime

    model_config = {"from_attributes": True}


class HealthResponse(BaseModel):
    status: str
