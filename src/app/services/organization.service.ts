import { inject, Injectable } from '@angular/core';
import { config } from '../config/config';
import { GenericApiService } from './generic-api.service';
import { Observable } from 'rxjs';
import { getAllResponse } from '../models/api';
import { Organization } from '../models/organization';

@Injectable({
  providedIn: 'root',
})
export class OrganizationService {
  private apiUrl = `${config.apiUrl}/organizations`;
  private genericService = inject(GenericApiService);

  constructor() {}

  getOrganizations(): Observable<getAllResponse<Organization>> {
    return this.genericService.getAll<getAllResponse<Organization>>(
      this.apiUrl
    );
  }

  getOrganization(id: number): Observable<getAllResponse<Organization>> {
    return this.genericService.getOne<getAllResponse<Organization>>(
      this.apiUrl,
      id
    );
  }

  createOrganization(
    organization: Organization
  ): Observable<getAllResponse<Organization>> {
    return this.genericService.create<
      Organization,
      getAllResponse<Organization>
    >(this.apiUrl, organization);
  }

  updateOrganization(
    organization: Organization,
    id: number
  ): Observable<getAllResponse<Organization>> {
    return this.genericService.update<
      Organization,
      getAllResponse<Organization>
    >(this.apiUrl, id, organization);
  }

  deleteOrganization(id: number): Observable<getAllResponse<Organization>> {
    return this.genericService.delete<getAllResponse<Organization>>(
      this.apiUrl,
      id
    );
  }
}
