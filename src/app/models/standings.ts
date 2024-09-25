export interface Standings {
  id_standings?: number;
  competition_id: number;
  team_id: number;
  competition_category_id: number;
  user_id: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface StandingsGetResponse {
  success: boolean;
  message: string;
  data: Standings;
  timestamp: string;
}

export interface StandingsCreateResponse {
  success: boolean;
  message: string;
  data: Standings;
  timestamp: string;
}

export interface StandingsUpdateResponse {
  success: boolean;
  message: string;
  data: Standings;
  timestamp: string;
}

export interface StandingsDeleteResponse {
  success: boolean;
  message: string;
  timestamp: string;
}
