import type { GameEngine } from "./engine";

const GAME_CODES = new Set([
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "Space",
  "KeyA",
  "KeyD",
  "KeyW",
  "KeyP",
  "KeyR",
  "KeyH",
  "KeyQ",
  "KeyM",
  "Escape",
  "Enter",
  "F1",
]);

function eventCode(event: KeyboardEvent): string {
  if (event.code) {
    return event.code;
  }
  if (event.key === " ") {
    return "Space";
  }
  if (event.key === "Escape" || event.key === "Enter" || event.key === "F1") {
    return event.key;
  }
  if (event.key.length === 1) {
    return `Key${event.key.toUpperCase()}`;
  }
  return event.key;
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable;
}

interface InputCallbacks {
  onMuteToggle?: () => void;
}

export class InputManager {
  private readonly engine: GameEngine;
  private readonly down = new Set<string>();
  private readonly onMuteToggle?: () => void;

  constructor(engine: GameEngine, callbacks: InputCallbacks = {}) {
    this.engine = engine;
    this.onMuteToggle = callbacks.onMuteToggle;
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
  }

  attach(): void {
    if (typeof window === "undefined") {
      return;
    }
    window.addEventListener("keydown", this.onKeyDown, true);
    window.addEventListener("keyup", this.onKeyUp, true);
  }

  detach(): void {
    if (typeof window === "undefined") {
      return;
    }
    window.removeEventListener("keydown", this.onKeyDown, true);
    window.removeEventListener("keyup", this.onKeyUp, true);
    this.down.clear();
    this.engine.setHeldKeys(this.down);
  }

  private onKeyDown(event: KeyboardEvent): void {
    const code = eventCode(event);
    if (isTypingTarget(event.target)) {
      return;
    }
    if (GAME_CODES.has(code)) {
      event.preventDefault();
    }
    this.down.add(code);
    this.engine.setHeldKeys(this.down);
    if (event.repeat) {
      this.handleHold(code);
      return;
    }
    this.handleImpulse(code);
    this.handleHold(code);
  }

  private onKeyUp(event: KeyboardEvent): void {
    this.down.delete(eventCode(event));
    this.engine.setHeldKeys(this.down);
  }

  private handleImpulse(code: string): void {
    if (code === "KeyM") {
      this.onMuteToggle?.();
      return;
    }
    if (code === "KeyQ") {
      this.engine.requestQuit();
      return;
    }
    if (code === "KeyP") {
      this.engine.togglePause();
      return;
    }
    if (code === "Escape") {
      this.engine.handleEscape();
      return;
    }
    if (code === "Enter") {
      this.engine.handleEnter();
      return;
    }
    if (code === "KeyH" || code === "F1") {
      this.engine.toggleHelp();
      return;
    }
    if (code === "KeyR") {
      this.engine.restart();
    }
  }

  private handleHold(code: string): void {
    if (code === "Space" || code === "KeyW" || code === "ArrowUp") {
      this.engine.requestShot();
    }
  }
}
