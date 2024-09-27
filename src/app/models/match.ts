import { MatchPlayerWithDetails } from './matchPlayer';
import { Team } from './team';

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

// export interface MatchWithDetails
//   extends Omit<Match, 'local_team' | 'visitor_team'> {
//   local_team: Pick<Team, 'name' | 'id_team' | 'avatar'>;
//   visitor_team: Pick<Team, 'name' | 'id_team' | 'avatar'>;
// }
export interface MatchWithDetails
  extends Pick<
    Match,
    'id_match' | 'status' | 'date' | 'user_id' | 'created_at' | 'updated_at'
  > {
  local_team: LocalTeam;
  visitor_team: VisitorTeam;
  competition_category: CompetitionCategory;
  competition: Competition;
  category: Category;
  organization: Organization;
  matchPlayers: MatchPlayerWithDetails[];
}

export interface LocalTeam {
  id_team: number;
  name: string;
  avatar: string;
}

export interface VisitorTeam {
  id_team: number;
  name: string;
  avatar: string;
}

export interface CompetitionCategory {
  id_competition_category: number;
  season: string;
}

export interface Competition {
  id_competition: number;
  name: string;
  format: string;
  is_initialized: number;
}

export interface Category {
  name: string;
  gender: string;
}

export interface Organization {
  name: string;
  address: string;
  logo: string;
}

export interface GetMatchesParams {
  q: string;
  page: string;
  limit: number;
  id_match: number;
  status: MatchStatus;
  local_team: number;
  visitor_team: number;
  date: Date;
  dateBefore: Date;
  dateAfter: Date;
  competition_category_id: number;
  user_id: number;
}
