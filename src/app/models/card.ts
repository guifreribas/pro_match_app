import { MatchWithDetails } from './match';
import { Player } from './player';

export type CardType = 'YELLOW' | 'RED' | 'BLUE';
export type CardPart =
  | 'FIRST_HALF'
  | 'SECOND_HALF'
  | 'EXTRA_TIME_FIRST_HALF'
  | 'EXTRA_TIME_SECOND_HALF'
  | 'PENALTIES';

export interface Card {
  id_card?: number;
  card_type: CardType;
  minute: number;
  part: CardPart;
  match_id: number;
  player_id: number;
  team_id: number;
  competition_id: number;
  user_id: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface CardWithPlayer extends Card {
  player?: Pick<Player, 'id_player' | 'name' | 'last_name' | 'dni' | 'avatar'>;
}

// export interface CardsPlayerStats {
//   player_id: number;
//   yellowCards: number;
//   redCards: number;
//   blueCards: number;
//   player: {
//     id_player: number;
//     name: string;
//     last_name: string;
//     avatar?: string;
//   };
//   team: {
//     id_team: number;
//     name: string;
//     avatar: string;
//   };
// }

export interface GetCardsPlayerStatsResponse {
  success: boolean;
  message: string;
  data: CardsPlayerStats[];
  timestamp: string;
}

export interface GetCardsParams {
  q: string;
  page: string;
  user_id: number;
  limit: number;
  match_id: number;
  team_id: number;
  player_id: number;
  competition_id: number;
}

export interface CardsPlayerStats {
  player_id: number;
  yellowCards: number;
  redCards: number;
  blueCards: number;
  player: {
    id_player: number;
    name: string;
    last_name: string;
    avatar?: string;
  };
  team: {
    id_team: number;
    name: string;
    avatar: string;
  };
  matches_played: number;
  matches: MatchWithDetails[];
}
