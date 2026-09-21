import type { Bullet, Enemy, EnemyType, Player } from "../types/game.types";
import { BULLET, COLORS, ENEMY, PLAYER, PLAYFIELD, SCORING } from "./constants";

let nextId = 1;

export function resetIds(): void {
  nextId = 1;
}

export function createPlayer(): Player {
  return {
    x: (PLAYFIELD.width - PLAYER.width) / 2,
    y: PLAYFIELD.height - 56,
    width: PLAYER.width,
    height: PLAYER.height,
    cooldown: 0,
  };
}

interface EnemySpec {
  type: EnemyType;
  hp: number;
  points: number;
  color: string;
}

function specForRow(row: number): EnemySpec {
  if (row === 0) {
    return { type: "tank", hp: 2, points: SCORING.tank, color: COLORS.amber };
  }
  if (row === 1) {
    return { type: "fast", hp: 1, points: SCORING.fast, color: COLORS.lime };
  }
  return { type: "basic", hp: 1, points: SCORING.basic, color: COLORS.magenta };
}

export function createEnemy(x: number, y: number, row: number): Enemy {
  const spec = specForRow(row);
  return {
    id: nextId++,
    x,
    y,
    width: ENEMY.width,
    height: ENEMY.height,
    type: spec.type,
    hp: spec.hp,
    points: spec.points,
    color: spec.color,
  };
}

export function createPlayerBullet(player: Player): Bullet {
  return {
    id: nextId++,
    x: player.x + player.width / 2 - BULLET.playerWidth / 2,
    y: player.y - BULLET.playerHeight,
    width: BULLET.playerWidth,
    height: BULLET.playerHeight,
    vy: BULLET.playerSpeed,
    fromPlayer: true,
  };
}

export function createEnemyBullet(enemy: Enemy, speed: number): Bullet {
  return {
    id: nextId++,
    x: enemy.x + enemy.width / 2 - BULLET.enemyWidth / 2,
    y: enemy.y + enemy.height,
    width: BULLET.enemyWidth,
    height: BULLET.enemyHeight,
    vy: speed,
    fromPlayer: false,
  };
}
