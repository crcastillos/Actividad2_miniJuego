from collections.abc import Generator
from datetime import UTC, datetime, timedelta

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

from app.db.models import Score
from app.db.session import get_session
from app.main import app


@pytest.fixture()
def engine():
    test_engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(test_engine)
    return test_engine


@pytest.fixture()
def client(engine) -> Generator[TestClient, None, None]:
    def override_session() -> Generator[Session, None, None]:
        with Session(engine) as session:
            yield session

    app.dependency_overrides[get_session] = override_session

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


def test_health(client: TestClient) -> None:
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_create_score(client: TestClient) -> None:
    response = client.post(
        "/api/scores",
        json={"player_alias": "  Nova_1  ", "score": 2500, "level": 3},
    )
    assert response.status_code == 201
    body = response.json()
    assert body["player_alias"] == "Nova_1"
    assert body["score"] == 2500
    assert body["level"] == 3
    assert body["id"] >= 1
    assert "created_at" in body


def test_ranking_order(client: TestClient) -> None:
    client.post("/api/scores", json={"player_alias": "Low", "score": 100, "level": 1})
    client.post("/api/scores", json={"player_alias": "High", "score": 900, "level": 2})
    client.post("/api/scores", json={"player_alias": "Mid", "score": 400, "level": 1})

    response = client.get("/api/scores?limit=10")
    assert response.status_code == 200
    aliases = [item["player_alias"] for item in response.json()]
    assert aliases == ["High", "Mid", "Low"]


def test_tie_breaks_by_oldest_date(client: TestClient, engine) -> None:
    older = datetime.now(UTC) - timedelta(minutes=5)
    newer = datetime.now(UTC)

    with Session(engine) as session:
        session.add(Score(player_alias="Second", score=1000, level=2, created_at=newer))
        session.add(Score(player_alias="First", score=1000, level=2, created_at=older))
        session.commit()

    response = client.get("/api/scores")
    aliases = [item["player_alias"] for item in response.json()]
    assert aliases[:2] == ["First", "Second"]


@pytest.mark.parametrize(
    ("payload", "status_code"),
    [
        ({"player_alias": "ab", "score": 10, "level": 1}, 422),
        ({"player_alias": "Invalid!", "score": 10, "level": 1}, 422),
        ({"player_alias": "Pilot", "score": -1, "level": 1}, 422),
        ({"player_alias": "Pilot", "score": 10, "level": 0}, 422),
        ({"player_alias": "   ", "score": 10, "level": 1}, 422),
    ],
)
def test_score_validation(client: TestClient, payload: dict, status_code: int) -> None:
    response = client.post("/api/scores", json=payload)
    assert response.status_code == status_code
