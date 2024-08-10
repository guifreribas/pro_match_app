export type FieldType =
  | 'INDOOR_SOCCER_TURF'
  | 'INDOOR_SOCCER'
  | 'SEVEN_A_SIDE_FOTBALL';

export interface Field {
  id_field: number;
  name: string;
  type: FieldType;
  organization_id: number;
  user_id: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface FieldCreate {
  name: string;
  type: FieldType;
  organization_id: number;
  user_id: number;
}

export interface FieldUpdate {
  name: string;
  type: FieldType;
}
