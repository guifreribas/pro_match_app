import { inject, Injectable } from '@angular/core';
import { config } from '@app/config/config';
import { GenericApiService } from './generic-api.service';
import { Observable } from 'rxjs';
import { getAllResponse } from '@app/models/api';
import { Field } from '@app/models/field';

@Injectable({
  providedIn: 'root',
})
export class FieldService {
  private apiUrl = `${config.apiUrl}/fields`;
  private genericService = inject(GenericApiService);

  constructor() {}

  getFields(): Observable<getAllResponse<Field>> {
    return this.genericService.getAll<getAllResponse<Field>>(this.apiUrl);
  }

  getField(id: number): Observable<getAllResponse<Field>> {
    return this.genericService.getOne<getAllResponse<Field>>(this.apiUrl, id);
  }

  createField(field: Field): Observable<getAllResponse<Field>> {
    return this.genericService.create<Field, getAllResponse<Field>>(
      this.apiUrl,
      field
    );
  }

  updateField(field: Field, id: number): Observable<getAllResponse<Field>> {
    return this.genericService.update<Field, getAllResponse<Field>>(
      this.apiUrl,
      id,
      field
    );
  }

  deleteField(id: number): Observable<getAllResponse<Field>> {
    return this.genericService.delete<getAllResponse<Field>>(this.apiUrl, id);
  }
}
