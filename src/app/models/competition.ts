export type CompetitionFormat = 'SINGLE_ROUND' | 'DOUBLE_ROUND' | 'KNOCKOUT';

export interface Competition {
  id_competition: number;
  name: string;
  format: CompetitionFormat;
  user_id: number;
  organization_id: number;
  created_at?: Date;
  updated_at?: Date;
}
