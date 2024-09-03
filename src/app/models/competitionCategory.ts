export interface CompetitionCategory {
  id_competition_category: number;
  competition_id: number;
  category_id: number;
  season: string;
  created_at?: Date;
  updated_at?: Date;
}
