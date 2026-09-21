import { LIVES, SCORING } from "./constants";

export interface ScoreState {
  score: number;
  lives: number;
  nextExtraLifeScore: number;
}

export function initialScoreState(): ScoreState {
  return {
    score: 0,
    lives: LIVES.initial,
    nextExtraLifeScore: SCORING.extraLifeEvery,
  };
}

export function applyScore(state: ScoreState, points: number): { extraLives: number } {
  state.score += points;
  let extraLives = 0;
  while (state.score >= state.nextExtraLifeScore) {
    state.lives += 1;
    extraLives += 1;
    state.nextExtraLifeScore += SCORING.extraLifeEvery;
  }
  return { extraLives };
}
