import { inject, Injectable } from '@angular/core';
import { config } from '../../config/config';
import { Observable } from 'rxjs';
import {
  deleteResponse,
  getAllResponse,
  getOneResponse,
  postResponse,
  updateResponse,
} from '../../models/api';
import { Category, GetCategoriesParams } from '../../models/category';
import { GenericApiService } from './generic-api.service';
import { urlParser } from '@app/utils/utils';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private apiUrl = `${config.apiUrl}/categories`;
  private genericService = inject(GenericApiService);

  constructor() {}

  getCategories(
    params?: Partial<GetCategoriesParams>
  ): Observable<getAllResponse<Category>> {
    const url = urlParser(params, this.apiUrl);
    return this.genericService.getAll<getAllResponse<Category>>(url);
  }

  getCategory(id: number): Observable<getOneResponse<Category>> {
    return this.genericService.getOne<getOneResponse<Category>>(
      this.apiUrl,
      id
    );
  }

  createCategory(category: Category): Observable<postResponse<Category>> {
    return this.genericService.create<Category, postResponse<Category>>(
      this.apiUrl,
      category
    );
  }

  updateCategory(
    category: Category,
    id: number
  ): Observable<updateResponse<Category>> {
    return this.genericService.update<Category, updateResponse<Category>>(
      this.apiUrl,
      id,
      category
    );
  }

  deleteCategory(id: number): Observable<deleteResponse> {
    return this.genericService.delete<deleteResponse>(this.apiUrl, id);
  }
}
