from datetime import UTC, datetime

from sqlmodel import Field, SQLModel


def utc_now() -> datetime:
    return datetime.now(UTC)


class Score(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    player_alias: str = Field(min_length=3, max_length=20, index=True)
    score: int = Field(ge=0)
    level: int = Field(ge=1)
    created_at: datetime = Field(default_factory=utc_now, index=True)
