from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from app.db.session import get_session
from app.schemas.score_schema import ScoreCreate, ScoreRead
from app.services.score_service import ScoreService

router = APIRouter(prefix="/api/scores", tags=["scores"])
SessionDep = Annotated[Session, Depends(get_session)]


@router.post("", response_model=ScoreRead, status_code=201)
def create_score(payload: ScoreCreate, session: SessionDep) -> ScoreRead:
    service = ScoreService(session)
    return ScoreRead.model_validate(service.create_score(payload))


@router.get("", response_model=list[ScoreRead])
def list_scores(
    session: SessionDep,
    limit: int = Query(default=10, ge=1, le=50),
) -> list[ScoreRead]:
    service = ScoreService(session)
    return [ScoreRead.model_validate(item) for item in service.list_scores(limit)]
