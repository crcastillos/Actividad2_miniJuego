# NEON SWARM

Mini juego arcade original inspirado en la lógica de un space shooter clásico. El jugador defiende la **línea de fotones** frente a un enjambre descendente. No usa marcas, sprites ni audio de Space Invaders.

| Capa | Stack |
| --- | --- |
| Backend | Python 3.11+, FastAPI, SQLModel, SQLite, Pytest, Ruff |
| Frontend | Expo (React Native + TypeScript), NativeWind, canvas en web |

Documentación de origen: [`Documentacion/Intenciones/intencion_1_crear_juego.md`](Documentacion/Intenciones/intencion_1_crear_juego.md)  
Plan de implementación: [`Documentacion/Planes/plan_1_crear_juego.md`](Documentacion/Planes/plan_1_crear_juego.md)

## Cómo ejecutarlo

Necesitas **Python 3.11+** y **Node.js 18+**. Arranca primero el backend y, en otra terminal, el frontend.

### 1. Backend (FastAPI)

En la raíz del repo:

```bash
cd backend
python -m venv .venv
```

Activa el entorno e instala dependencias:

```bash
# Windows (PowerShell)
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

# Linux / macOS
# source .venv/bin/activate
# pip install -r requirements.txt
# uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Opcional: copia `backend/.env.example` a `backend/.env` (SQLite y CORS ya tienen valores por defecto).

Cuando arranque:

- API: [http://127.0.0.1:8000](http://127.0.0.1:8000)
- Salud: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)
- Docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

Pruebas del backend (con el venv activo):

```bash
pytest
ruff check .
```

### 2. Frontend (Expo Web)

En otra terminal, desde la raíz del repo:

```bash
cd frontend
npm install
npm run web
```

Abre la URL que muestre Expo, normalmente [http://localhost:8081](http://localhost:8081). El teclado físico es el control principal.

Opcional: copia `frontend/.env.example` a `frontend/.env`. El valor por defecto es `EXPO_PUBLIC_API_URL=http://localhost:8000`. Cámbialo solo si el backend no está en ese host.

Si el backend no está en marcha, el juego sigue funcionando; el ranking y el guardado de puntaje mostrarán un aviso.

## Arquitectura

- El **backend** solo persiste ranking local (`GET/POST /api/scores` y `GET /api/health`). No hay autenticación ni servicios cloud.
- El **frontend** separa pantallas React Native (inicio, HUD, pausa, ayuda, game over) del **motor 2D** en TypeScript (`src/game`). El punto de entrada es `frontend/src/App.tsx` porque Expo 57 trata `src/app/` como Expo Router.
- El canvas pinta el playfield; NativeWind estiliza la interfaz retro.

## Decisiones técnicas

- Nombre original: **NEON SWARM**.
- Canvas HTML en Expo Web para un loop estable y teclado físico.
- SQLModel para alinear esquemas Pydantic y SQLite.
- Vida extra con `while (score >= nextExtraLifeScore)` para no repetir el mismo múltiplo de 1000.
- Copy centralizado en `frontend/src/copy/es.ts` con verbosidad media (indicación, sugerencia, tip, error, éxito).
- AsyncStorage recuerda el último alias y si el sonido está silenciado.
- Efectos 8-bit originales con Web Audio (sin samples de terceros). Q en pausa sale al hangar sin guardar.

## Mejoras futuras

- Música de fondo original con licencia libre.
- Controles táctiles opcionales en móvil, sin sustituir el teclado.
- Más tipos de oleada, escudos y jefes.
- Tabla de ranking con filtros por oleada.
