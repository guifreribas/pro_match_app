export interface CompetitionCategory {
  id_competition_category: number;
  competition_id: number;
  category_id: number;
  season: string;
  user_id: number;
  created_at?: Date;
  updated_at?: Date;
}
