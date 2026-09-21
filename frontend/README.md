# NEON SWARM — Frontend

Cliente **Expo + React Native + TypeScript** del arcade **NEON SWARM**. El objetivo principal es **Expo Web** con teclado físico. NativeWind aporta el estilo retro de menús y HUD; el campo de juego se dibuja en un canvas.

El punto de entrada es `src/App.tsx` (Expo 57 interpreta `src/app/` como Expo Router, por eso no usamos esa carpeta).

## Requisitos

- Node.js 18 o superior
- Backend local en `http://localhost:8000`

## Variables de entorno

Crea `.env` (ya hay un valor por defecto):

```env
EXPO_PUBLIC_API_URL=http://localhost:8000
```

## Instalación y ejecución

```bash
cd frontend
npm install
npm run start
```

Para navegador (recomendado, teclado obligatorio):

```bash
npm run web
```

Abre la URL que muestre Expo (habitualmente `http://localhost:8081`).

## Controles

- Mover: flechas o A/D
- Disparar: Espacio, W o flecha arriba
- Pausar: P o Escape
- Reanudar: P o Enter
- Reiniciar: R
- Ayuda: H o F1
- Silenciar efectos: M
- Salir al hangar: Q (solo en pausa; pide confirmación y no guarda el puntaje)

## Notas

- El último alias válido se guarda en AsyncStorage.
- Los efectos de sonido son beeps 8-bit originales (Web Audio). No hay música de fondo.
- Si el backend no está en marcha, puedes jugar igual; el ranking y el guardado de puntaje mostrarán un aviso claro.
