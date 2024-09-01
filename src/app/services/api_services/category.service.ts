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
import { Category } from '../../models/category';
import { GenericApiService } from './generic-api.service';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private apiUrl = `${config.apiUrl}/categories`;
  private genericService = inject(GenericApiService);

  constructor() {}

  getCategories(): Observable<getAllResponse<Category>> {
    return this.genericService.getAll<getAllResponse<Category>>(this.apiUrl);
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
