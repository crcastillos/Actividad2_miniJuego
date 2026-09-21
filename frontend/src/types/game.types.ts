export type GameStatus = "idle" | "ready" | "playing" | "paused" | "help" | "gameOver";

export type EnemyType = "basic" | "fast" | "tank";

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Player extends Rect {
  cooldown: number;
}

export interface Enemy extends Rect {
  id: number;
  type: EnemyType;
  hp: number;
  points: number;
  color: string;
}

export interface Bullet extends Rect {
  id: number;
  vy: number;
  fromPlayer: boolean;
}

export type GameEventType =
  | "extraLife"
  | "waveCleared"
  | "hit"
  | "gameOver"
  | "playerShot"
  | "enemyShot"
  | "enemyDestroyed"
  | "moveStart";

export interface GameEvent {
  type: GameEventType;
  lives?: number;
  wave?: number;
  enemyType?: EnemyType;
}

export interface GameSnapshot {
  status: GameStatus;
  alias: string;
  score: number;
  lives: number;
  wave: number;
  player: Player;
  enemies: Enemy[];
  playerBullets: Bullet[];
  enemyBullets: Bullet[];
  invulnerable: boolean;
  flash: boolean;
}

export interface HudView {
  status: GameStatus;
  alias: string;
  score: number;
  lives: number;
  wave: number;
}

export interface ScorePayload {
  player_alias: string;
  score: number;
  level: number;
}
