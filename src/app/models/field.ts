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

export interface FieldCreateResponse {
  success: boolean;
  message: string;
  data: Field;
  timestamp: string;
}

export interface FieldUpdateResponse {
  success: boolean;
  message: string;
  data: Field;
  timestamp: string;
}

export interface FieldDeleteResponse {
  success: boolean;
  message: string;
  timestamp: string;
}

export interface FieldsGetResponse {
  success: boolean;
  message: string;
  data: {
    items: Field[];
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

export interface FieldGetResponse {
  success: boolean;
  message: string;
  data: Field;
  timestamp: string;
}
