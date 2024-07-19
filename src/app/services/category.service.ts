import { inject, Injectable } from '@angular/core';
import { config } from '../config/config';
import { Observable } from 'rxjs';
import {
  deleteOneResponse,
  getAllResponse,
  getOneResponse,
  postOneResponse,
  putOneResponse,
} from '../models/api';
import { Category } from '../models/category';
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

  createCategory(category: Category): Observable<postOneResponse<Category>> {
    return this.genericService.create<Category, postOneResponse<Category>>(
      this.apiUrl,
      category
    );
  }

  updateCategory(
    category: Category,
    id: number
  ): Observable<putOneResponse<Category>> {
    return this.genericService.update<Category, putOneResponse<Category>>(
      this.apiUrl,
      id,
      category
    );
  }

  deleteCategory(id: number): Observable<deleteOneResponse> {
    return this.genericService.delete<deleteOneResponse>(this.apiUrl, id);
  }
}
