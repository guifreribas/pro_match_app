import { inject, Injectable } from '@angular/core';
import { config } from '@app/config/config';
import { GenericApiService } from './generic-api.service';
import { urlParser } from '@app/utils/utils';
import { CompetitionCategory } from '@app/models/competitionCategory';

interface GetCompetitionCategoriesParams {
  q?: string;
  page?: string;
  user_id?: number;
  limit?: number;
}

@Injectable({
  providedIn: 'root',
})
export class CompetitionCategoryService {
  private apiUrl = `${config.apiUrl}/competition-categories`;
  private _genericServices = inject(GenericApiService);

  constructor() {}

  getCompetitionCategories(params?: Partial<GetCompetitionCategoriesParams>) {
    const url = urlParser(params, this.apiUrl);
    return this._genericServices.getAll<any>(url);
  }

  getCompetitionCategory(id: number) {
    return this._genericServices.getOne<any>(this.apiUrl, id);
  }

  createCompetitionCategory(competitionCategory: CompetitionCategory) {
    return this._genericServices.create<CompetitionCategory, any>(
      this.apiUrl,
      competitionCategory
    );
  }

  updateCompetitionCategory(
    competitionCategory: Partial<CompetitionCategory>,
    id: number
  ) {
    return this._genericServices.update<CompetitionCategory, any>(
      this.apiUrl,
      id,
      competitionCategory
    );
  }

  deleteCompetitionCategory(id: number) {
    return this._genericServices.delete<any>(this.apiUrl, id);
  }
}
