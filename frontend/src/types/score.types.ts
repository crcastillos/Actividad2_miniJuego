export interface ScoreRecord {
  id: number;
  player_alias: string;
  score: number;
  level: number;
  created_at: string;
}

export interface ScoreCreate {
  player_alias: string;
  score: number;
  level: number;
}
