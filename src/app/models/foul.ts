export type FoulPart =
  | 'FIRST_HALF'
  | 'SECOND_HALF'
  | 'EXTRA_TIME_FIRST_HALF'
  | 'EXTRA_TIME_SECOND_HALF'
  | 'PENALTIES';

export interface Foul {
  id_foul: number;
  minute: number;
  part: FoulPart;
  player_id: number;
  team_id: number;
  match_id: number;
  created_at?: Date;
  updated_at?: Date;
}