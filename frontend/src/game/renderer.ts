import type { Enemy, GameSnapshot } from "../types/game.types";
import { COLORS, PLAYFIELD } from "./constants";

interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
}

const stars: Star[] = Array.from({ length: 80 }, () => ({
  x: Math.random() * PLAYFIELD.width,
  y: Math.random() * PLAYFIELD.height,
  size: Math.random() * 1.6 + 0.4,
  speed: Math.random() * 28 + 10,
}));

export function drawFrame(ctx: CanvasRenderingContext2D, snapshot: GameSnapshot, dt: number): void {
  const { width, height } = PLAYFIELD;
  ctx.fillStyle = COLORS.void;
  ctx.fillRect(0, 0, width, height);

  const starDelta = snapshot.status === "playing" ? dt : dt * 0.15;
  ctx.fillStyle = "#94A3B8";
  for (const star of stars) {
    star.y += star.speed * starDelta;
    if (star.y > height) {
      star.y = 0;
      star.x = Math.random() * width;
    }
    ctx.globalAlpha = 0.35 + star.size * 0.25;
    ctx.fillRect(star.x, star.y, star.size, star.size);
  }
  ctx.globalAlpha = 1;

  ctx.strokeStyle = COLORS.cyan;
  ctx.globalAlpha = 0.35;
  ctx.lineWidth = 2;
  ctx.strokeRect(8, 8, width - 16, height - 16);
  ctx.globalAlpha = 1;

  ctx.strokeStyle = COLORS.danger;
  ctx.setLineDash([6, 8]);
  ctx.globalAlpha = 0.7;
  ctx.beginPath();
  ctx.moveTo(16, PLAYFIELD.dangerY);
  ctx.lineTo(width - 16, PLAYFIELD.dangerY);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.globalAlpha = 1;

  for (const enemy of snapshot.enemies) {
    drawEnemy(ctx, enemy);
  }

  ctx.fillStyle = COLORS.cyan;
  for (const bullet of snapshot.playerBullets) {
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
  }

  ctx.fillStyle = COLORS.magenta;
  for (const bullet of snapshot.enemyBullets) {
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
  }

  if (!snapshot.flash) {
    drawPlayer(ctx, snapshot.player.x, snapshot.player.y, snapshot.player.width, snapshot.player.height);
  }

  ctx.fillStyle = "rgba(5,5,16,0.18)";
  for (let y = 0; y < height; y += 4) {
    ctx.fillRect(0, y, width, 1);
  }
}

function drawPlayer(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
): void {
  ctx.fillStyle = COLORS.cyan;
  ctx.beginPath();
  ctx.moveTo(x + width / 2, y);
  ctx.lineTo(x + width, y + height);
  ctx.lineTo(x + width * 0.72, y + height * 0.72);
  ctx.lineTo(x + width * 0.28, y + height * 0.72);
  ctx.lineTo(x, y + height);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#ECFEFF";
  ctx.fillRect(x + width / 2 - 2, y + 6, 4, 8);
}

function drawEnemy(ctx: CanvasRenderingContext2D, enemy: Enemy): void {
  ctx.fillStyle = enemy.color;
  const { x, y, width, height } = enemy;
  if (enemy.type === "tank") {
    ctx.fillRect(x, y + 4, width, height - 6);
    ctx.fillRect(x + 4, y, width - 8, 6);
    ctx.fillRect(x - 2, y + 8, 6, 6);
    ctx.fillRect(x + width - 4, y + 8, 6, 6);
  } else if (enemy.type === "fast") {
    ctx.beginPath();
    ctx.moveTo(x + width / 2, y);
    ctx.lineTo(x + width, y + height / 2);
    ctx.lineTo(x + width / 2, y + height);
    ctx.lineTo(x, y + height / 2);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.fillRect(x + 4, y + 4, width - 8, height - 8);
    ctx.fillRect(x, y + 8, 6, 6);
    ctx.fillRect(x + width - 6, y + 8, 6, 6);
    ctx.fillRect(x + 8, y, 6, 6);
    ctx.fillRect(x + width - 14, y, 6, 6);
  }
  ctx.fillStyle = COLORS.void;
  ctx.fillRect(x + 8, y + 8, 5, 5);
  ctx.fillRect(x + width - 13, y + 8, 5, 5);
}
