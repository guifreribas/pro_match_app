export interface Category {
  id_category: number;
  name: string;
  organization_id: number;
  competition_id: number;
  user_id: number;
  created_at?: Date;
  updated_at?: Date;
}
