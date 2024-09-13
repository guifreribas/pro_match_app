export type MatchPart =
  | 'FIRST_HALF'
  | 'SECOND_HALF'
  | 'EXTRA_TIME_FIRST_HALF'
  | 'EXTRA_TIME_SECOND_HALF'
  | 'PENALTIES';

export type MatchStatus =
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'FINISHED'
  | 'POSTPONED'
  | 'CANCELLED'
  | 'ABANDONED'
  | 'TO_BE_SCHEDULED';

export interface Match {
  id_match?: number;
  status: MatchStatus;
  local_team: number;
  visitor_team: number;
  date: Date;
  competition_category_id: number;
  user_id: number;
  created_at?: Date;
  updated_at?: Date;
}
