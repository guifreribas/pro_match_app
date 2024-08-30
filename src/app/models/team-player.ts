import { Player } from './player';
import { Team } from './team';

export interface TeamPlayer {
  team_player_id: number;
  team_id: number;
  player_id: number;
  user_id: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateTeamPlayer
  extends Pick<TeamPlayer, 'team_id' | 'player_id' | 'user_id'> {}

export interface TeamPlayerCreateResponse {
  success: boolean;
  message: string;
  data: TeamPlayer;
  timestamp: string;
}

export interface TeamPlayerUpdateResponse {
  success: boolean;
  message: string;
  data: TeamPlayer;
  timestamp: string;
}

export interface TeamPlayerDeleteResponse {
  success: boolean;
  message: string;
  timestamp: string;
}

type PlayerSummary = Pick<Player, 'name' | 'last_name' | 'birthday' | 'dni'> & {
  avatar?: string;
};
type TeamSummary = Pick<Team, 'name'> & {
  avatar?: string;
};

export interface TeamPlayerWithDetails extends TeamPlayer {
  player?: PlayerSummary;
  team?: TeamSummary;
}

export interface TeamPlayersGetResponse {
  success: boolean;
  message: string;
  data: {
    items: TeamPlayerWithDetails[];
    itemCount: number;
    totalItems: number;
    currentPage: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  links: {
    self: string;
    first: string;
    last: string;
    next: string;
    previous: string;
  };
  timestamp: string;
}

export interface TeamPlayerGetResponse {
  success: boolean;
  message: string;
  data: TeamPlayer;
  timestamp: string;
}

export interface TeamPlayerCreateResponse {
  success: boolean;
  message: string;
  data: TeamPlayer;
  timestamp: string;
}
