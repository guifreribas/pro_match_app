export interface Team {
  id_team?: number;
  name: string;
  avatar?: string;
  user_id: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface TeamsGetResponse {
  success: boolean;
  message: string;
  data: {
    items: Team[];
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

export interface TeamGetResponse {
  success: boolean;
  message: string;
  data: Team;
  timestamp: string;
}

export interface TeamsCreateResponse {
  success: boolean;
  message: string;
  data: Team;
  timestamp: string;
}

export interface TeamUpdateResponse {
  success: boolean;
  message: string;
  data: Team;
  timestamp: string;
}

export interface TeamDeleteResponse {
  success: boolean;
  message: string;
  timestamp: string;
}
