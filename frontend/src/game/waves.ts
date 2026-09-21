import type { Enemy } from "../types/game.types";
import { ENEMY, PLAYFIELD, WAVE } from "./constants";
import { createEnemy } from "./entities";

export function waveColumns(wave: number): number {
  return Math.min(11, ENEMY.cols + Math.floor((wave - 1) / 2));
}

export function waveRows(wave: number): number {
  return Math.min(5, ENEMY.rows + (wave >= 4 ? 1 : 0));
}

export function createWave(wave: number): Enemy[] {
  const cols = waveColumns(wave);
  const rows = waveRows(wave);
  const formationWidth = cols * ENEMY.width + (cols - 1) * ENEMY.gapX;
  const originX = (PLAYFIELD.width - formationWidth) / 2;
  const enemies: Enemy[] = [];

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const x = originX + col * (ENEMY.width + ENEMY.gapX);
      const y = ENEMY.startY + row * (ENEMY.height + ENEMY.gapY);
      enemies.push(createEnemy(x, y, row));
    }
  }

  return enemies;
}

export function formationSpeed(wave: number): number {
  return WAVE.baseSpeed + (wave - 1) * WAVE.speedGrowth;
}

export function enemyFireInterval(wave: number): number {
  return Math.max(WAVE.minFire, WAVE.baseFire - (wave - 1) * WAVE.fireDecay);
}

export function enemyBulletSpeed(wave: number): number {
  return WAVE.enemyBulletSpeed + (wave - 1) * WAVE.enemyBulletGrowth;
}

export function frontLine(enemies: Enemy[]): Enemy[] {
  const lowest = new Map<number, Enemy>();
  for (const enemy of enemies) {
    const key = Math.round(enemy.x / 20);
    const current = lowest.get(key);
    if (!current || enemy.y > current.y) {
      lowest.set(key, enemy);
    }
  }
  return [...lowest.values()];
}
