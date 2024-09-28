export interface Standings {
  id_standings: number;
  competition_id: number;
  team_id: number;
  competition_category_id: number;
  user_id: number;
  matches_played: number;
  victories: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  goals_difference: number;
  points: number;
  created_at: Date;
  updated_at: Date;
}

export interface StandingsCreateDto
  extends Omit<
    Standings,
    'id_standings' | 'goals_difference' | 'created_at' | 'updated_at'
  > {}

export interface GetStandingsParams {
  q: string;
  page: string;
  user_id: number;
  limit: number;
  team_id: number;
  competition_category_id: number;
  competition_id: number;
  victories: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  goals_difference: number;
  points: number;
}

export interface StandingsWithDetails {
  id_standings: number;
  team_id: number;
  competition_id: number;
  competition_category_id: number;
  user_id: number;
  matches_played: number;
  victories: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  goals_difference: number;
  points: number;
  team: Team;
  competition: Competition;
  competition_category: CompetitionCategory;
  category: Category;
}

interface Team {
  id_team: number;
  name: string;
  avatar: string;
}

interface Competition {
  id_competition: number;
  name: string;
  format: string;
}

interface CompetitionCategory {
  id_competition_category: number;
  season: string;
}

interface Category {
  name: string;
  gender: string;
}
