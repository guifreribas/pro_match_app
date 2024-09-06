import { Category } from './category';
import { CompetitionCategory } from './competitionCategory';
import { CompetitionType } from './competitionType';
import { Organization } from './organization';

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

export interface CompetitionWithDetails extends Competition {
  organization: Pick<Organization, 'name' | 'logo' | 'address'> | null;
  competitionType: Pick<CompetitionType, 'name'> | null;
  category: Pick<Category, 'name' | 'gender'> | null;
  competitionCategory: Pick<CompetitionCategory, 'season'> | null;
}

export interface CompetitionsGetResponse {
  success: boolean;
  message: string;
  data: {
    items: CompetitionWithDetails[];
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

export interface CompetitionGetResponse {
  success: boolean;
  message: string;
  data: Competition;
  timestamp: string;
}

export interface CompetitionCreateResponse {
  success: boolean;
  message: string;
  data: Competition;
  timestamp: string;
}

export interface CompetitionUpdateResponse {
  success: boolean;
  message: string;
  data: Competition;
  timestamp: string;
}

export interface CompetitionDeleteResponse {
  success: boolean;
  message: string;
  timestamp: string;
}
