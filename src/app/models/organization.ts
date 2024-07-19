export interface Organization {
  id_organization: number;
  name: string;
  logo: string;
  competition_id: number;
  sport_id: number;
  user_id: number;
  created_at?: Date;
  updated_at?: Date;
}
