import { inject, Injectable } from '@angular/core';
import { GenericApiService } from './generic-api.service';
import { config } from '@app/config/config';
import { Overview, OverviewGetResponse } from '@app/models/overview';

@Injectable({
  providedIn: 'root',
})
export class OverviewService {
  private apiUrl = `${config.apiUrl}/overview`;

  private _genericServices = inject(GenericApiService);

  constructor() {}

  getOverview() {
    return this._genericServices.getAll<OverviewGetResponse>(this.apiUrl);
  }
}
