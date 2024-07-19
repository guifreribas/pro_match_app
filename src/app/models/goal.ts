export type GoalPart =
  | 'FIRST_HALF'
  | 'SECOND_HALF'
  | 'EXTRA_TIME_FIRST_HALF'
  | 'EXTRA_TIME_SECOND_HALF'
  | 'PENALTIES';

export interface Goal {
  id_goal: number;
  minute: number;
  part: GoalPart;
  player_id: number;
  team_id: number;
  match_id: number;
  created_at?: Date;
  updated_at?: Date;
}
