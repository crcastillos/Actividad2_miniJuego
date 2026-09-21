# NEON SWARM — Backend

API REST local para persistir el ranking de **NEON SWARM**. No hay autenticación ni servicios cloud.

## Requisitos

- Python 3.11 o superior

## Variables de entorno

Copia `.env.example` a `.env` (opcional; hay valores por defecto):

```env
DATABASE_URL=sqlite:///./retro_invaders.db
APP_ENV=development
CORS_ORIGINS=http://localhost:8081,http://localhost:19006,http://127.0.0.1:8081,http://127.0.0.1:19006
```

## Instalación y ejecución

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Linux/macOS
# .venv\Scripts\activate    # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Documentación interactiva: [http://localhost:8000/docs](http://localhost:8000/docs)

## Endpoints

- `GET /api/health` — estado del servicio
- `POST /api/scores` — guarda un puntaje (`player_alias`, `score`, `level`)
- `GET /api/scores?limit=10` — ranking local (mayor puntaje primero; empate por fecha más antigua)

## Pruebas y formato

```bash
pytest
ruff check .
ruff format .
```
