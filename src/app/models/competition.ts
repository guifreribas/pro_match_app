export type CompetitionType = 'LIGUE' | 'TOURNAMENT';
export type CompetitionSubtype = 'SINGLE_ROUND' | 'DOUBLE_ROUND' | 'KNOCKOUT';

export interface Competition {
  id_competition: number;
  type: CompetitionType;
  subtype: CompetitionSubtype;
  user_id: number;
  organization_id: number;
  created_at?: Date;
  updated_at?: Date;
}
