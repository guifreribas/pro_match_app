export interface getAllResponse<T> {
  success: boolean;
  message: string;
  data: Data<T>;
  links: Links;
  timestamp: string;
}

interface Data<T> {
  items: T[];
  itemCount: number;
  totalItems: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface Links {
  self: string;
  first: string;
  last: string;
  next: string;
  previous: string;
}

export interface getAllResponseError {
  success: false;
  message: string;
  data: null;
  links: null;
  timestamp: string;
}

export interface getOneResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface getOneResponseError {
  success: false;
  message: string;
  data: null;
  timestamp: string;
}

export interface postResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface postResponseError {
  success: false;
  message: string;
  data: null;
  timestamp: string;
}

export interface updateResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface updateResponseError {
  success: false;
  message: string;
  data: null;
  timestamp: string;
}

export interface deleteResponse {
  success: boolean;
  message: string;
  timestamp: string;
}

export interface deleteResponseError {
  success: false;
  message: string;
  timestamp: string;
}
