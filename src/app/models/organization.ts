export interface Organization {
  id_organization: number;
  name: string;
  address: string;
  logo: string;
  user_id: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface OrganizationsGetResponse {
  success: boolean;
  message: string;
  data: {
    items: Organization[];
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

export interface OrganizationGetResponse {
  success: boolean;
  message: string;
  data: Organization;
  timestamp: string;
}

export interface OrganizationsCreateResponse {
  success: boolean;
  message: string;
  data: Organization;
  timestamp: string;
}

export interface OrganizationUpdateResponse {
  success: boolean;
  message: string;
  data: Organization;
  timestamp: string;
}

export interface OrganizationDeleteResponse {
  success: boolean;
  message: string;
  timestamp: string;
}
