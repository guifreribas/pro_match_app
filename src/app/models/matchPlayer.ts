import { TeamPlayer } from './team-player';
import { Team } from './team';
import { Player } from './player';

export interface MatchPlayer {
  id_match_player?: number;
  match_id: number;
  player_id: number;
  team_id: number;
  user_id: number;
  team_player_id: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface MatchPlayerWithDetails extends MatchPlayer {
  player: Pick<Player, 'id_player' | 'name' | 'last_name' | 'dni' | 'avatar'>;
  team: Pick<Team, 'id_team' | 'name' | 'avatar'>;
  player_number: Pick<TeamPlayer, 'player_number'>;
}

export interface MatchPlayersGetResponse {
  success: boolean;
  message: string;
  data: {
    items: MatchPlayerWithDetails[];
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

export interface MatchPlayerGetResponse {
  success: boolean;
  message: string;
  data: MatchPlayer;
  timestamp: string;
}

export interface MatchPlayerCreateResponse {
  success: boolean;
  message: string;
  data: MatchPlayer;
  timestamp: string;
}

export interface MatchPlayerUpdateResponse {
  success: boolean;
  message: string;
  data: MatchPlayer;
  timestamp: string;
}

export interface MatchPlayerDeleteResponse {
  success: boolean;
  message: string;
  timestamp: string;
}
