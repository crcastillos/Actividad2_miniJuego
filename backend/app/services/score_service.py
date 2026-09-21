from sqlmodel import Session, select

from app.db.models import Score
from app.schemas.score_schema import ScoreCreate


class ScoreService:
    def __init__(self, session: Session) -> None:
        self.session = session

    def create_score(self, payload: ScoreCreate) -> Score:
        score = Score(
            player_alias=payload.player_alias,
            score=payload.score,
            level=payload.level,
        )
        self.session.add(score)
        self.session.commit()
        self.session.refresh(score)
        return score

    def list_scores(self, limit: int) -> list[Score]:
        statement = (
            select(Score)
            .order_by(Score.score.desc(), Score.created_at.asc())
            .limit(limit)
        )
        return list(self.session.exec(statement).all())
