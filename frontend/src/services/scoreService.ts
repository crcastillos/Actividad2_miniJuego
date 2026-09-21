import type { ScoreCreate, ScoreRecord } from "../types/score.types";
import { apiRequest } from "./apiClient";

export async function fetchScores(limit = 10): Promise<ScoreRecord[]> {
  return apiRequest<ScoreRecord[]>(`/api/scores?limit=${limit}`);
}

export async function saveScore(payload: ScoreCreate): Promise<ScoreRecord> {
  return apiRequest<ScoreRecord>("/api/scores", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function rankingPosition(scores: ScoreRecord[], id: number): number | null {
  const index = scores.findIndex((item) => item.id === id);
  return index >= 0 ? index + 1 : null;
}
