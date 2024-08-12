import { inject, Injectable } from '@angular/core';
import { config } from '@app/config/config';
import { GenericApiService } from './generic-api.service';
import { Observable } from 'rxjs';
import { getAllResponse } from '@app/models/api';
import {
  Field,
  FieldCreateResponse,
  FieldDeleteResponse,
  FieldGetResponse,
  FieldsGetResponse,
} from '@app/models/field';

@Injectable({
  providedIn: 'root',
})
export class FieldService {
  private apiUrl = `${config.apiUrl}/fields`;
  private genericService = inject(GenericApiService);

  constructor() {}

  getFields(): Observable<getAllResponse<FieldsGetResponse>> {
    return this.genericService.getAll<getAllResponse<FieldsGetResponse>>(
      this.apiUrl
    );
  }

  getField(id: number): Observable<getAllResponse<FieldGetResponse>> {
    return this.genericService.getOne<getAllResponse<FieldGetResponse>>(
      this.apiUrl,
      id
    );
  }

  createField(field: Field): Observable<getAllResponse<FieldCreateResponse>> {
    return this.genericService.create<
      Field,
      getAllResponse<FieldCreateResponse>
    >(this.apiUrl, field);
  }

  updateField(field: Field, id: number): Observable<getAllResponse<Field>> {
    return this.genericService.update<Field, getAllResponse<Field>>(
      this.apiUrl,
      id,
      field
    );
  }

  deleteField(id: number): Observable<getAllResponse<FieldDeleteResponse>> {
    return this.genericService.delete<getAllResponse<FieldDeleteResponse>>(
      this.apiUrl,
      id
    );
  }
}
