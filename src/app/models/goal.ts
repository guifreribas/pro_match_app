import { MatchWithDetails } from './match';
import { Player } from './player';

export type GoalPart =
  | 'FIRST_HALF'
  | 'SECOND_HALF'
  | 'EXTRA_TIME_FIRST_HALF'
  | 'EXTRA_TIME_SECOND_HALF'
  | 'PENALTIES';

export interface Goal {
  id_goal?: number;
  minute: number;
  part: GoalPart;
  player_id: number;
  team_id: number;
  match_id: number;
  user_id: number;
  competition_id: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface GoalWithPlayer extends Goal {
  player?: Pick<Player, 'id_player' | 'name' | 'last_name' | 'dni' | 'avatar'>;
}

export interface GetGoalsParams {
  q: string;
  page: string;
  user_id: number;
  match_id: number;
  player_id: number;
  team_id: number;
  competition_id: number;
  id_goal: number;
  limit: number;
}

export interface Scorers {
  player_id: number;
  total_goals: number;
  player: {
    id_player: number;
    name: string;
    last_name: string;
    dni: string;
    avatar?: string;
  };
  team: {
    id_team: number;
    name: string;
    avatar: string;
  };
  match: {
    id_match: number;
    status: string;
    date: Date;
  };
  matches_played: number;
  matches: MatchWithDetails[];
}

export interface GetScorersResponse {
  success: boolean;
  message: string;
  data: {
    currentPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    items: Scorers[];
    pageSize: number;
    totalGroups: number;
    totalPages: number;
  };
  timestamp: string;
}
