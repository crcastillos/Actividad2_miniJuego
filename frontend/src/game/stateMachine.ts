import type { GameStatus } from "../types/game.types";

export type StateEvent =
  | "pause"
  | "resume"
  | "openHelp"
  | "closeHelp"
  | "gameOver"
  | "restart"
  | "play";

export function transition(status: GameStatus, event: StateEvent, helpReturn?: GameStatus): GameStatus {
  switch (event) {
    case "play":
      return "playing";
    case "pause":
      return status === "playing" ? "paused" : status;
    case "resume":
      return status === "paused" ? "playing" : status;
    case "openHelp":
      return status === "playing" || status === "paused" ? "help" : status;
    case "closeHelp":
      return status === "help" ? (helpReturn ?? "playing") : status;
    case "gameOver":
      return "gameOver";
    case "restart":
      return "playing";
    default:
      return status;
  }
}
