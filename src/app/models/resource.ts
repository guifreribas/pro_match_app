export type ResourceType = 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'AUDIO';

export interface ResourceData {
  name: string;
  type: ResourceType;
}

export interface CreateResourceData {
  file: File;
}

export interface Resource extends ResourceData {
  id_resource: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface ResourcesGetResponse {
  success: boolean;
  message: string;
  data: {
    items: Resource[];
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

export interface ResourceGetResponse {
  success: boolean;
  message: string;
  data: Resource;
  timestamp: string;
}

export interface ResourceCreateResponse {
  success: boolean;
  message: string;
  data: Resource;
  timestamp: string;
}

export interface ResourceUpdateResponse {
  success: boolean;
  message: string;
  data: Resource;
  timestamp: string;
}

export interface ResourceDeleteResponse {
  success: boolean;
  message: string;
  timestamp: string;
}
