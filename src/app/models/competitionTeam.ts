export interface CompetitionTeam {
  id_competition_team: number;
  competition_category_id: number;
  team_id: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface CompetitionTeamWithDetails extends CompetitionTeam {
  team: {
    id_team: number;
    name: string;
    avatar: string;
  };
}

export interface CompetitionTeamGetResponse {
  success: boolean;
  message: string;
  data: CompetitionTeam;
  timestamp: string;
}

export interface CompetitionTeamsGetResponse {
  success: boolean;
  message: string;
  data: {
    items: CompetitionTeam[];
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

export interface CompetitionTeamCreateResponse {
  success: boolean;
  message: string;
  data: CompetitionTeam;
  timestamp: string;
}

export interface CompetitionTeamUpdateResponse {
  success: boolean;
  message: string;
  data: CompetitionTeam;
  timestamp: string;
}

export interface CompetitionTeamDeleteResponse {
  success: boolean;
  message: string;
  timestamp: string;
}
