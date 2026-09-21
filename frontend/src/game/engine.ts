import type {
  Bullet,
  Enemy,
  GameEvent,
  GameSnapshot,
  GameStatus,
  HudView,
  Player,
  ScorePayload,
} from "../types/game.types";
import { aabb } from "./collisions";
import { ENEMY, PLAYER, PLAYFIELD, SCORING } from "./constants";
import { createEnemyBullet, createPlayer, createPlayerBullet, resetIds } from "./entities";
import { applyScore, initialScoreState, type ScoreState } from "./scoring";
import { transition } from "./stateMachine";
import {
  createWave,
  enemyBulletSpeed,
  enemyFireInterval,
  formationSpeed,
  frontLine,
} from "./waves";

export class GameEngine {
  alias: string;
  private status: GameStatus = "playing";
  private helpReturn: GameStatus = "playing";
  private scores: ScoreState = initialScoreState();
  private wave = 1;
  private player: Player = createPlayer();
  private enemies: Enemy[] = [];
  private playerBullets: Bullet[] = [];
  private enemyBullets: Bullet[] = [];
  private held = new Set<string>();
  private formationDir = 1;
  private enemyShootTimer = 2.4;
  private invulnTimer = 0;
  private shotQueued = false;
  private events: GameEvent[] = [];
  private saveConsumed = false;
  private quitRequested = false;
  private confirmingLeave = false;
  private cancelConfirmRequested = false;
  private wasMoving = false;
  private moveTickTimer = 0;

  constructor(alias: string) {
    this.alias = alias;
    this.resetMatch();
  }

  resetMatch(): void {
    resetIds();
    this.status = "playing";
    this.helpReturn = "playing";
    this.scores = initialScoreState();
    this.wave = 1;
    this.player = createPlayer();
    this.playerBullets = [];
    this.enemyBullets = [];
    this.formationDir = 1;
    this.invulnTimer = 0;
    this.shotQueued = false;
    this.saveConsumed = false;
    this.quitRequested = false;
    this.confirmingLeave = false;
    this.cancelConfirmRequested = false;
    this.wasMoving = false;
    this.moveTickTimer = 0;
    this.enemies = createWave(this.wave);
    this.enemyShootTimer = Math.max(2.4, enemyFireInterval(this.wave));
  }

  setHeldKeys(keys: Set<string>): void {
    this.held = keys;
  }

  requestShot(): void {
    this.shotQueued = true;
  }

  togglePause(): void {
    if (this.status === "playing") {
      this.status = transition(this.status, "pause");
      return;
    }
    if (this.status === "paused") {
      if (this.confirmingLeave) {
        this.clearLeaveConfirm();
        return;
      }
      this.status = transition(this.status, "resume");
      this.quitRequested = false;
    }
  }

  handleEscape(): void {
    if (this.status === "help") {
      this.closeHelp();
      return;
    }
    if (this.status === "playing") {
      this.status = transition(this.status, "pause");
      return;
    }
    if (this.status === "paused" && this.confirmingLeave) {
      this.clearLeaveConfirm();
    }
  }

  handleEnter(): void {
    if (this.status !== "paused") {
      return;
    }
    if (this.confirmingLeave) {
      this.clearLeaveConfirm();
      return;
    }
    this.status = transition(this.status, "resume");
    this.quitRequested = false;
  }

  toggleHelp(): void {
    if (this.status === "help") {
      this.closeHelp();
      return;
    }
    if (this.status === "playing" || this.status === "paused") {
      this.helpReturn = this.status;
      this.status = transition(this.status, "openHelp");
    }
  }

  closeHelp(): void {
    this.status = transition(this.status, "closeHelp", this.helpReturn);
  }

  pause(): void {
    if (this.status === "playing") {
      this.status = "paused";
    }
  }

  resume(): void {
    if (this.status === "paused") {
      this.status = "playing";
      this.quitRequested = false;
      this.confirmingLeave = false;
      this.cancelConfirmRequested = false;
    }
  }

  restart(): void {
    this.resetMatch();
  }

  requestQuit(): void {
    if (this.status === "paused") {
      this.quitRequested = true;
    }
  }

  consumeQuitRequest(): boolean {
    if (!this.quitRequested) {
      return false;
    }
    this.quitRequested = false;
    return true;
  }

  setConfirmingLeave(value: boolean): void {
    this.confirmingLeave = value;
  }

  consumeCancelConfirm(): boolean {
    if (!this.cancelConfirmRequested) {
      return false;
    }
    this.cancelConfirmRequested = false;
    return true;
  }

  private clearLeaveConfirm(): void {
    this.confirmingLeave = false;
    this.cancelConfirmRequested = true;
  }

  consumeGameOverSave(): ScorePayload | null {
    if (this.status !== "gameOver" || this.saveConsumed) {
      return null;
    }
    this.saveConsumed = true;
    return {
      player_alias: this.alias,
      score: this.scores.score,
      level: this.wave,
    };
  }

  getView(): HudView {
    return {
      status: this.status,
      alias: this.alias,
      score: this.scores.score,
      lives: this.scores.lives,
      wave: this.wave,
    };
  }

  getSnapshot(): GameSnapshot {
    return {
      status: this.status,
      alias: this.alias,
      score: this.scores.score,
      lives: this.scores.lives,
      wave: this.wave,
      player: this.player,
      enemies: this.enemies,
      playerBullets: this.playerBullets,
      enemyBullets: this.enemyBullets,
      invulnerable: this.invulnTimer > 0,
      flash: this.invulnTimer > 0 && Math.floor(this.invulnTimer * 12) % 2 === 0,
    };
  }

  update(dt: number): GameEvent[] {
    this.events = [];
    if (this.status !== "playing") {
      return [];
    }

    this.invulnTimer = Math.max(0, this.invulnTimer - dt);
    this.player.cooldown = Math.max(0, this.player.cooldown - dt);
    this.movePlayer(dt);
    this.handleShooting();
    this.moveBullets(dt);
    this.moveFormation(dt);
    this.handleEnemyFire(dt);
    this.resolveCollisions();
    this.cullBullets();
    this.checkWaveClear();
    return this.events;
  }

  private movePlayer(dt: number): void {
    const left = this.held.has("ArrowLeft") || this.held.has("KeyA");
    const right = this.held.has("ArrowRight") || this.held.has("KeyD");
    let vx = 0;
    if (left) {
      vx -= PLAYER.speed;
    }
    if (right) {
      vx += PLAYER.speed;
    }
    this.player.x = Math.max(
      PLAYFIELD.padding,
      Math.min(PLAYFIELD.width - PLAYFIELD.padding - this.player.width, this.player.x + vx * dt),
    );

    const moving = vx !== 0;
    if (moving && !this.wasMoving) {
      this.events.push({ type: "moveStart" });
      this.moveTickTimer = 0.18;
    } else if (moving) {
      this.moveTickTimer -= dt;
      if (this.moveTickTimer <= 0) {
        this.events.push({ type: "moveStart" });
        this.moveTickTimer = 0.18;
      }
    }
    this.wasMoving = moving;
  }

  private handleShooting(): void {
    const wantsShot =
      this.shotQueued || this.held.has("Space") || this.held.has("KeyW") || this.held.has("ArrowUp");
    this.shotQueued = false;
    if (!wantsShot || this.player.cooldown > 0 || this.playerBullets.length >= PLAYER.maxBullets) {
      return;
    }
    this.playerBullets.push(createPlayerBullet(this.player));
    this.player.cooldown = PLAYER.cooldown;
    this.events.push({ type: "playerShot" });
  }

  private moveBullets(dt: number): void {
    for (const bullet of this.playerBullets) {
      bullet.y += bullet.vy * dt;
    }
    for (const bullet of this.enemyBullets) {
      bullet.y += bullet.vy * dt;
    }
  }

  private moveFormation(dt: number): void {
    if (this.enemies.length === 0) {
      return;
    }
    const speed = formationSpeed(this.wave);
    const dx = this.formationDir * speed * dt;
    const minX = Math.min(...this.enemies.map((enemy) => enemy.x));
    const maxX = Math.max(...this.enemies.map((enemy) => enemy.x + enemy.width));
    const wouldHit =
      (this.formationDir > 0 && maxX + dx >= PLAYFIELD.width - PLAYFIELD.padding) ||
      (this.formationDir < 0 && minX + dx <= PLAYFIELD.padding);

    if (wouldHit) {
      this.formationDir *= -1;
      for (const enemy of this.enemies) {
        enemy.y += ENEMY.drop;
      }
      return;
    }

    for (const enemy of this.enemies) {
      enemy.x += dx;
    }
  }

  private handleEnemyFire(dt: number): void {
    this.enemyShootTimer -= dt;
    if (this.enemyShootTimer > 0 || this.enemies.length === 0) {
      return;
    }
    const shooters = frontLine(this.enemies);
    const shooter = shooters[Math.floor(Math.random() * shooters.length)];
    if (shooter) {
      this.enemyBullets.push(createEnemyBullet(shooter, enemyBulletSpeed(this.wave)));
      this.events.push({ type: "enemyShot" });
    }
    this.enemyShootTimer = Math.max(2.4, enemyFireInterval(this.wave));
  }

  private resolveCollisions(): void {
    const remainingEnemies: Enemy[] = [];
    for (const enemy of this.enemies) {
      let alive = true;
      this.playerBullets = this.playerBullets.filter((bullet) => {
        if (!alive || !aabb(bullet, enemy)) {
          return true;
        }
        enemy.hp -= 1;
        if (enemy.hp <= 0) {
          alive = false;
          const granted = applyScore(this.scores, enemy.points);
          this.pushExtraLifeEvents(granted.extraLives);
          this.events.push({ type: "enemyDestroyed", enemyType: enemy.type });
        }
        return false;
      });
      if (alive) {
        remainingEnemies.push(enemy);
      }
    }
    this.enemies = remainingEnemies;

    this.enemyBullets = this.enemyBullets.filter((bullet) => {
      if (this.invulnTimer > 0 || !aabb(bullet, this.player)) {
        return true;
      }
      this.takeHit();
      return false;
    });

    if (this.invulnTimer <= 0) {
      for (const enemy of this.enemies) {
        if (aabb(enemy, this.player) || enemy.y + enemy.height >= PLAYFIELD.dangerY) {
          this.takeHit();
          break;
        }
      }
    }
  }

  private cullBullets(): void {
    this.playerBullets = this.playerBullets.filter((bullet) => bullet.y + bullet.height > 0);
    this.enemyBullets = this.enemyBullets.filter((bullet) => bullet.y < PLAYFIELD.height);
  }

  private checkWaveClear(): void {
    if (this.status !== "playing" || this.enemies.length > 0) {
      return;
    }
    const granted = applyScore(this.scores, SCORING.waveBonus);
    this.pushExtraLifeEvents(granted.extraLives);
    this.wave += 1;
    this.events.push({ type: "waveCleared", wave: this.wave });
    this.enemies = createWave(this.wave);
    this.playerBullets = [];
    this.enemyBullets = [];
    this.formationDir = 1;
    this.enemyShootTimer = Math.max(2.4, enemyFireInterval(this.wave));
  }

  private takeHit(): void {
    this.scores.lives -= 1;
    this.events.push({ type: "hit", lives: this.scores.lives });
    if (this.scores.lives <= 0) {
      this.scores.lives = 0;
      this.status = transition(this.status, "gameOver");
      this.events.push({ type: "gameOver" });
      return;
    }
    this.invulnTimer = PLAYER.invulnTime;
    this.player = createPlayer();
    this.playerBullets = [];
    this.enemyBullets = [];
    this.enemies = createWave(this.wave);
    this.formationDir = 1;
    this.enemyShootTimer = Math.max(2.4, enemyFireInterval(this.wave));
  }

  private pushExtraLifeEvents(count: number): void {
    for (let i = 0; i < count; i += 1) {
      this.events.push({ type: "extraLife", lives: this.scores.lives });
    }
  }
}
