export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export interface Category {
  id_category?: number;
  name: string;
  gender: Gender;
  organization_id: number;
  user_id: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface CategoriesGetResponse {
  success: boolean;
  message: string;
  data: {
    items: Category[];
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

export interface CategoryGetResponse {
  success: boolean;
  message: string;
  data: Category;
  timestamp: string;
}

export interface CategoriesCreateResponse {
  success: boolean;
  message: string;
  data: Category;
  timestamp: string;
}

export interface CategoryUpdateResponse {
  success: boolean;
  message: string;
  data: Category;
  timestamp: string;
}

export interface CategoryDeleteResponse {
  success: boolean;
  message: string;
  timestamp: string;
}
