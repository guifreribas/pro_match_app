export interface Player {
  id_player: number;
  name: string;
  last_name: string;
  dni: string;
  avatar?: string;
  birthday: Date;
  created_at?: Date;
  updated_at?: Date;
}

export interface PlayerGetResponse {
  success: boolean;
  message: string;
  data: Player;
  timestamp: string;
}

export interface PlayersGetResponse {
  success: boolean;
  message: string;
  data: {
    items: Player[];
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

export interface PlayerCreateResponse {
  success: boolean;
  message: string;
  data: Player;
  timestamp: string;
}

export interface PlayerUpdateResponse {
  success: boolean;
  message: string;
  data: Player;
  timestamp: string;
}

export interface PlayerDeleteResponse {
  success: boolean;
  message: string;
  timestamp: string;
}

export interface PlayerCreate {
  name: string;
  lastName: string;
  dni: string;
  avatar?: string;
  birthday: string;
}
