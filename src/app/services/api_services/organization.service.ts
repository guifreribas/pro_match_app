import { inject, Injectable } from '@angular/core';
import { config } from '../../config/config';
import { GenericApiService } from './generic-api.service';
import { Observable } from 'rxjs';
import {
  getAllResponse,
  getOneResponse,
  postResponse,
  updateResponse,
} from '../../models/api';
import { Organization } from '../../models/organization';
import { urlParser } from '@app/utils/utils';

interface GetOrganizationsParams {
  q?: string;
  page?: string;
  user_id: number;
}

@Injectable({
  providedIn: 'root',
})
export class OrganizationService {
  public apiUrl = `${config.apiUrl}/organizations`;
  private genericService = inject(GenericApiService);

  constructor() {}

  getOrganizations(
    params?: GetOrganizationsParams
  ): Observable<getAllResponse<Organization>> {
    const url = urlParser(params, this.apiUrl);
    return this.genericService.getAll<getAllResponse<Organization>>(url);
  }

  getOrganization(id: number): Observable<getOneResponse<Organization>> {
    return this.genericService.getOne<getOneResponse<Organization>>(
      this.apiUrl,
      id
    );
  }

  createOrganization(
    organization: Organization
  ): Observable<postResponse<Organization>> {
    return this.genericService.create<Organization, postResponse<Organization>>(
      this.apiUrl,
      organization
    );
  }

  updateOrganization(
    organization: Partial<Organization>,
    id: number
  ): Observable<updateResponse<Organization>> {
    return this.genericService.update<
      Organization,
      updateResponse<Organization>
    >(this.apiUrl, id, organization);
  }

  deleteOrganization(id: number): Observable<getAllResponse<Organization>> {
    return this.genericService.delete<getAllResponse<Organization>>(
      this.apiUrl,
      id
    );
  }
}
