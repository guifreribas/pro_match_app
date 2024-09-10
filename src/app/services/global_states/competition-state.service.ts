import { Injectable, signal } from '@angular/core';
import { getOneResponse } from '@app/models/api';
import { CompetitionWithDetails } from '@app/models/competition';

@Injectable({
  providedIn: 'root',
})
export class CompetitionStateService {
  public competitions = signal<getOneResponse<CompetitionWithDetails> | null>(
    null
  );

  constructor() {}
}
