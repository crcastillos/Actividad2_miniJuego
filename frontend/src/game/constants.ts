export const COLORS = {
  void: "#050510",
  panel: "#0B1020",
  cyan: "#22D3EE",
  magenta: "#F472B6",
  lime: "#A3E635",
  amber: "#FBBF24",
  mist: "#C7D2FE",
  danger: "#FB7185",
} as const;

export const PLAYFIELD = {
  width: 960,
  height: 640,
  padding: 16,
  dangerY: 560,
} as const;

export const PLAYER = {
  width: 42,
  height: 22,
  speed: 380,
  cooldown: 0.28,
  maxBullets: 4,
  invulnTime: 1.6,
} as const;

export const BULLET = {
  playerWidth: 4,
  playerHeight: 14,
  playerSpeed: -560,
  enemyWidth: 4,
  enemyHeight: 12,
} as const;

export const ENEMY = {
  width: 32,
  height: 22,
  cols: 8,
  rows: 4,
  gapX: 18,
  gapY: 16,
  startY: 64,
  drop: 18,
} as const;

export const SCORING = {
  basic: 100,
  fast: 150,
  tank: 250,
  waveBonus: 500,
  extraLifeEvery: 1000,
} as const;

export const LIVES = {
  initial: 3,
} as const;

export const WAVE = {
  baseSpeed: 58,
  speedGrowth: 16,
  baseFire: 1.85,
  fireDecay: 0.08,
  minFire: 0.55,
  enemyBulletSpeed: 210,
  enemyBulletGrowth: 14,
} as const;

export const ALIAS_PATTERN = /^[A-Za-z0-9 _-]+$/;
export const ALIAS_MIN = 3;
export const ALIAS_MAX = 20;
