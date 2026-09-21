# Intención 1: Crear juego retro tipo Space Invaders

## Rol que debe asumir la IA

Actúa como un **senior full-stack developer especializado en videojuegos retro 2D**, con experiencia en:

- Backend con **Python** aplicando buenas prácticas de desarrollo.
- API REST con **FastAPI**.
- Persistencia local con **SQLite**.
- Frontend con **React Native**, **TypeScript** y **Tailwind / NativeWind**.
- Arquitectura limpia, separación de responsabilidades, código mantenible y pruebas básicas.

Debes desarrollar un juego retro inspirado en la lógica arcade de **Space Invaders**, sin copiar marcas, assets propietarios, nombres comerciales protegidos ni gráficos originales. La referencia conceptual es un juego arcade clásico de disparos espaciales donde el jugador controla una nave/cañón, dispara a enemigos descendentes y acumula puntos.

Referencia de contexto:
https://es.wired.com/articulos/space-invaders-creador-revela-origen-del-celebre-videojuego-viene-nueva-version-mini-arcade-cab

---

## Objetivo general

Crear una aplicación funcional de videojuego retro tipo **space shooter / invaders**, con:

- Backend en **Python**.
- Frontend en **React Native** con **TypeScript**.
- Estilos usando **Tailwind / NativeWind**.
- Controles tradicionales de teclado.
- Sistema de vidas.
- Sistema de puntaje.
- Registro de alias del jugador.
- Tabla local de puntajes.
- Pantalla o modal de ayuda con controles.
- Buenas prácticas de estructura, validación, manejo de errores y documentación.

No se requiere autenticación.

---

## Stack tecnológico obligatorio

### Backend

Usar:

- Python 3.11 o superior.
- FastAPI.
- Uvicorn.
- Pydantic.
- SQLite como almacenamiento local.
- SQLAlchemy o SQLModel para acceso a datos.
- Pytest para pruebas mínimas.
- Ruff o Black para formato/linting.

### Frontend

Usar:

- React Native.
- TypeScript.
- Expo, preferiblemente para simplificar ejecución.
- NativeWind como integración Tailwind para React Native.
- AsyncStorage o mecanismo equivalente para guardar configuración local del jugador si aplica.
- Consumo de API REST del backend para guardar y consultar puntajes.

> Nota técnica: debido a que el juego usa teclado tradicional, debe contemplarse ejecución en entorno compatible con teclado físico, por ejemplo **Expo Web**, escritorio o navegador. En móvil puede agregarse soporte opcional con controles táctiles, pero no debe sustituir el soporte de teclado.

---

## Reglas principales del juego

El juego debe funcionar con una mecánica retro tipo arcade:

1. El jugador controla una nave ubicada en la parte inferior de la pantalla.
2. La nave puede moverse horizontalmente hacia la izquierda y derecha.
3. El jugador puede disparar proyectiles hacia arriba.
4. Los enemigos aparecen en formación desde la parte superior.
5. Los enemigos se desplazan horizontalmente y descienden progresivamente.
6. El jugador gana puntos al destruir enemigos.
7. Si un enemigo alcanza la zona inferior o impacta al jugador, el jugador pierde una vida.
8. El juego inicia con **3 vidas**.
9. Por cada **1000 puntos acumulados**, el jugador obtiene **1 vida adicional**.
10. La vida adicional debe otorgarse una sola vez por cada múltiplo de 1000 alcanzado.
11. Cuando las vidas llegan a 0, el juego termina.
12. Al finalizar la partida, el puntaje debe guardarse localmente asociado al alias del jugador.

---

## Datos del jugador

Antes de iniciar la partida debe solicitarse:

- Nombre o alias de **Player 1**.

Validaciones:

- El alias es obligatorio.
- Longitud recomendada: mínimo 3 caracteres, máximo 20 caracteres.
- Permitir letras, números, espacios, guion y guion bajo.
- El alias debe limpiarse con `trim()` antes de enviarse al backend.
- Si el alias no es válido, mostrar mensaje claro al usuario.

---

## Sistema de puntaje

Implementar una lógica clara de puntos. Propuesta inicial:

| Evento | Puntos |
|---|---:|
| Enemigo básico destruido | 100 |
| Enemigo rápido destruido | 150 |
| Enemigo resistente destruido | 250 |
| Bonus por limpiar oleada | 500 |

La IA puede ajustar la distribución siempre que documente el motivo y mantenga balance básico.

Regla obligatoria:

- Cada vez que el puntaje acumulado alcance un nuevo múltiplo de **1000**, se debe sumar **1 vida adicional**.

Ejemplo:

```txt
Puntaje inicial: 0
Vidas iniciales: 3
Al llegar a 1000 puntos: vidas = 4
Al llegar a 2000 puntos: vidas = 5
Al llegar a 3000 puntos: vidas = 6
```

Evitar bug común:

- No sumar vidas repetidamente mientras el puntaje permanezca por encima del mismo múltiplo.
- Usar una variable de control como `nextExtraLifeScore = 1000`.

---

## Controles de teclado obligatorios

El juego debe incluir controles tradicionales de teclado:

| Acción | Tecla principal | Tecla alternativa |
|---|---|---|
| Mover izquierda | ArrowLeft | A |
| Mover derecha | ArrowRight | D |
| Disparar | Space | W / ArrowUp |
| Pausar | P | Escape |
| Reanudar | P | Enter |
| Reiniciar juego | R | - |
| Mostrar ayuda | H | F1 |

Requisitos:

- Los controles deben estar documentados en una pantalla o modal de ayuda.
- Debe existir un botón visible de **Ayuda**.
- La ayuda debe poder abrirse desde teclado con `H` o `F1`.
- El juego debe pausar correctamente cuando se muestre la ayuda.

---

## Estados del juego

Implementar una máquina de estados simple:

```txt
idle        -> pantalla inicial / captura de alias
ready       -> alias válido, listo para iniciar
playing     -> partida activa
paused      -> partida pausada
help        -> ayuda visible
gameOver    -> partida finalizada
```

Comportamiento esperado:

- En `idle`, solicitar alias del jugador.
- En `playing`, actualizar movimiento, disparos, enemigos, colisiones y puntaje.
- En `paused`, congelar el loop del juego.
- En `help`, mostrar ayuda y congelar el loop.
- En `gameOver`, mostrar puntaje final y opción de reiniciar.

---

## Pantallas requeridas

### 1. Pantalla inicial

Debe mostrar:

- Nombre del juego.
- Estética retro.
- Campo para ingresar alias de Player 1.
- Botón para iniciar partida.
- Botón para ver ayuda.
- Tabla breve de mejores puntajes locales.

### 2. Pantalla de juego

Debe mostrar:

- Área de juego.
- Nave del jugador.
- Enemigos.
- Proyectiles.
- Puntaje actual.
- Alias del jugador.
- Vidas actuales.
- Nivel u oleada actual.
- Botón de pausa.
- Botón de ayuda.

### 3. Pantalla de pausa

Debe mostrar:

- Texto “Juego pausado”.
- Opción de reanudar.
- Opción de reiniciar.
- Opción de ayuda.

### 4. Pantalla de ayuda

Debe mostrar:

- Tabla de controles.
- Explicación breve de objetivos.
- Regla de vidas.
- Regla de vida adicional cada 1000 puntos.
- Opción de cerrar ayuda.

### 5. Pantalla de game over

Debe mostrar:

- Alias del jugador.
- Puntaje final.
- Vidas finales en 0.
- Posición en el ranking local si aplica.
- Botón para jugar nuevamente.
- Botón para volver al inicio.

---

## Backend requerido

Crear una API REST con FastAPI.

### Estructura recomendada

```txt
backend/
  app/
    main.py
    core/
      config.py
    db/
      database.py
      models.py
      session.py
    schemas/
      score_schema.py
    services/
      score_service.py
    api/
      routes/
        scores.py
        health.py
    tests/
      test_scores.py
  requirements.txt
  README.md
```

### Entidad Score

Campos mínimos:

```txt
id: integer
player_alias: string
score: integer
level: integer
created_at: datetime
```

Validaciones:

- `player_alias` obligatorio.
- `score` debe ser mayor o igual a 0.
- `level` debe ser mayor o igual a 1.
- Registrar fecha/hora automática.

### Endpoints mínimos

#### Health check

```http
GET /api/health
```

Respuesta esperada:

```json
{
  "status": "ok"
}
```

#### Crear puntaje

```http
POST /api/scores
```

Body:

```json
{
  "player_alias": "Player1",
  "score": 2500,
  "level": 3
}
```

Respuesta esperada:

```json
{
  "id": 1,
  "player_alias": "Player1",
  "score": 2500,
  "level": 3,
  "created_at": "2026-09-20T21:00:00"
}
```

#### Consultar ranking local

```http
GET /api/scores?limit=10
```

Respuesta esperada:

```json
[
  {
    "id": 1,
    "player_alias": "Player1",
    "score": 2500,
    "level": 3,
    "created_at": "2026-09-20T21:00:00"
  }
]
```

Orden:

- Mayor puntaje primero.
- En caso de empate, fecha más antigua primero.

---

## Frontend requerido

Crear una aplicación React Native con TypeScript.

### Estructura recomendada

```txt
frontend/
  src/
    app/
      App.tsx
    components/
      GameCanvas.tsx
      HelpModal.tsx
      ScoreBoard.tsx
      PlayerForm.tsx
      RetroButton.tsx
      Hud.tsx
    game/
      engine.ts
      collisions.ts
      constants.ts
      entities.ts
      input.ts
      scoring.ts
      stateMachine.ts
    services/
      apiClient.ts
      scoreService.ts
    storage/
      localPlayerStorage.ts
    types/
      game.types.ts
      score.types.ts
    styles/
      global.css
  package.json
  README.md
```

### Motor del juego

Crear una lógica separada del componente visual.

Debe incluir:

- Loop de juego con `requestAnimationFrame` o mecanismo equivalente.
- Control de delta time.
- Movimiento del jugador.
- Movimiento de enemigos.
- Generación de disparos.
- Detección de colisiones.
- Eliminación de entidades fuera de pantalla.
- Incremento de dificultad por oleada.
- Sistema de pausa.
- Sistema de reinicio.

### Renderizado

La IA puede elegir entre:

1. Componentes React Native posicionados absolutamente.
2. Canvas compatible con Expo Web.
3. Librería 2D ligera compatible con React Native.

Priorizar simplicidad, mantenibilidad y compatibilidad con teclado.

---

## Diseño visual

Aplicar estilo retro:

- Fondo oscuro.
- Colores tipo neón.
- Tipografía monoespaciada si está disponible.
- Bordes pixelados o simulación visual arcade.
- HUD claro y legible.
- Botones grandes y consistentes.

No usar assets propietarios de Space Invaders.

Crear enemigos simples con figuras geométricas o sprites propios generados con CSS/React Native.

---

## Buenas prácticas obligatorias

### Backend

- Separar rutas, servicios, modelos y esquemas.
- Usar validaciones con Pydantic.
- Manejar errores HTTP correctamente.
- Evitar lógica de negocio dentro de los controladores.
- Usar SQLite local para persistencia.
- Incluir pruebas mínimas de endpoints.
- Documentar cómo ejecutar el backend.

### Frontend

- Usar TypeScript estricto.
- Separar lógica del juego de componentes visuales.
- Evitar componentes excesivamente grandes.
- Centralizar constantes del juego.
- Crear tipos para entidades, puntajes y estados.
- Manejar errores al consumir API.
- Mostrar mensajes claros al usuario.
- Mantener UI responsive.

### General

- No implementar autenticación.
- No usar servicios cloud.
- No guardar datos sensibles.
- No incluir claves API.
- No usar imágenes, sonidos o marcas protegidas sin licencia.

---

## Variables de configuración

Crear configuración simple para el frontend:

```env
EXPO_PUBLIC_API_URL=http://localhost:8000
```

Backend:

```env
DATABASE_URL=sqlite:///./retro_invaders.db
APP_ENV=development
```

---

## Criterios de aceptación

El desarrollo se considera correcto si cumple con lo siguiente:

- El backend inicia correctamente con FastAPI.
- La API expone health check.
- La API permite guardar puntajes.
- La API permite consultar ranking local.
- El frontend solicita alias antes de iniciar.
- El juego inicia con 3 vidas.
- El jugador puede moverse con teclado.
- El jugador puede disparar con teclado.
- Los enemigos aparecen y pueden ser destruidos.
- El puntaje aumenta al destruir enemigos.
- Cada 1000 puntos se otorga exactamente 1 vida adicional.
- El juego puede pausarse y reanudarse.
- El juego puede reiniciarse.
- Existe pantalla o modal de ayuda con controles.
- Al terminar la partida se guarda el puntaje asociado al alias.
- Se puede consultar una tabla de mejores puntajes.
- El código está organizado y documentado.
- No existe autenticación.

---

## Entregables esperados

La IA debe entregar:

1. Código completo del backend.
2. Código completo del frontend.
3. Instrucciones de instalación.
4. Instrucciones de ejecución.
5. Pruebas mínimas del backend.
6. Explicación breve de la arquitectura.
7. Lista de decisiones técnicas tomadas.
8. Lista de mejoras futuras recomendadas.

---

## Comandos esperados

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Linux/macOS
# .venv\Scripts\activate    # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run start
```

Para entorno web:

```bash
npm run web
```

---

## Consideraciones de implementación

Implementar la lógica de vida adicional de forma segura:

```ts
if (score >= nextExtraLifeScore) {
  lives += 1;
  nextExtraLifeScore += 1000;
}
```

Si el puntaje puede aumentar más de 1000 puntos en una sola actualización, usar `while`:

```ts
while (score >= nextExtraLifeScore) {
  lives += 1;
  nextExtraLifeScore += 1000;
}
```

---

## Resultado esperado

El resultado debe ser una aplicación jugable, simple, limpia y funcional, con estética retro, controles de teclado, persistencia local de puntajes y una base técnica mantenible para futuras mejoras.
