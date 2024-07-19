export type MatchPart =
  | 'FIRST_HALF'
  | 'SECOND_HALF'
  | 'EXTRA_TIME_FIRST_HALF'
  | 'EXTRA_TIME_SECOND_HALF'
  | 'PENALTIES';

export interface Match {
  id_match: number;
  minute: number;
  part: MatchPart;
  player_id: number;
  team_id: number;
  category_id: number;
  created_at?: Date;
  updated_at?: Date;
}
