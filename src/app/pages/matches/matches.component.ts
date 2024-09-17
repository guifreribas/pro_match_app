import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterLink } from '@angular/router';
import { DatepickerComponent } from '@app/components/atom/datepicker/datepicker.component';
import { DashboardPanelLayoutComponent } from '@app/layouts/dashboard-panel-layout/dashboard-panel-layout.component';
import { getAllResponse } from '@app/models/api';
import {
  Match,
  MatchesGetResponse,
  MatchStatus,
  MatchWithDetails,
} from '@app/models/match';
import { MatchService } from '@app/services/api_services/match.service';
import { UserStateService } from '@app/services/global_states/user-state.service';
import { filter, Subject } from 'rxjs';

type DateFilterType = 'DATE' | 'RANGE_DATE';
type Action = 'NEXT' | 'PREVIOUS' | 'GO_ON_PAGE';

interface GetMatchesParams {
  q?: string;
  page?: string;
  id_match?: number;
  status: MatchStatus;
  local_team: number;
  visitor_team: number;
  date: Date;
  dateBefore: Date;
  dateAfter: Date;
  competition_category_id: number;
  user_id: number;
  action: Action;
}

@Component({
  selector: 'app-matches',
  standalone: true,
  imports: [
    DashboardPanelLayoutComponent,
    ReactiveFormsModule,
    CommonModule,
    RouterLink,
    DatepickerComponent,
    MatDatepickerModule,
    MatInputModule,
    MatFormFieldModule,
    MatMomentDateModule,
  ],
  templateUrl: './matches.component.html',
  styleUrl: './matches.component.scss',
})
export class MatchesComponent {
  public matchesResponse = signal<getAllResponse<MatchWithDetails> | null>(
    null
  );
  public matches = signal<MatchWithDetails[]>([]);
  public currentPage = 1;
  public searchedMatches = signal<Match[] | null>(null);
  public matchForm = new FormGroup({
    startDate: new FormControl(null, [Validators.required]),
    finishDate: new FormControl(null, [Validators.required]),
    dateTypeSelect: new FormControl('DATE'),
  });
  public dateFilterType = signal<DateFilterType>('DATE');
  public placeHolder = 'Fecha';

  private _matechService = inject(MatchService);
  private _userState = inject(UserStateService);
  private _searchSubject = new Subject<string>();
  private _hasFetchedMatches = false;

  constructor() {
    effect(() => {
      const user = this._userState.me();
      if (user?.id_user && this._hasFetchedMatches === false) {
        this._getMatches({ user_id: user.id_user });
        this._hasFetchedMatches = true;
      }
    });

    this.matchForm.controls.dateTypeSelect.valueChanges.subscribe((value) => {
      this.dateFilterType.set(value as DateFilterType);
    });

    this.matchForm.valueChanges.subscribe(() => {
      // console.log('MATCH FORM CHANGED', this.matchForm.value);
      const startDate = this.matchForm.controls.startDate.value;
      const finishDate = this.matchForm.controls.finishDate.value;
      const filterType = this.matchForm.controls.dateTypeSelect.value;
      console.log(finishDate, startDate);
      if (filterType === 'DATE' && startDate) {
        this._getMatches({
          user_id: this._userState.me()?.id_user,
          date: startDate,
        });
      }
      if (filterType === 'RANGE_DATE' && startDate && finishDate) {
        console.log('RANGE DATE', filterType, startDate, finishDate);
        this._getMatches({
          user_id: this._userState.me()?.id_user,
          // date: startDate,
          dateAfter: startDate,
          dateBefore: finishDate,
        });
      }
    });
  }

  private _getMatches(params?: Partial<GetMatchesParams>) {
    this._matechService.getMatches(params).subscribe({
      next: (res) => {
        console.log({ res });
        console.log({ matches: res.data.items });
        this.matchesResponse.set(res);
        this.matches.set(res.data.items);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  goOnPage(page: number) {
    this._getMatches({
      action: 'GO_ON_PAGE',
      page: page.toString(),
      user_id: this._userState.me()?.id_user,
    });
  }

  goPreviousPage() {
    const currentPage = this.matchesResponse()?.data?.currentPage ?? 0;
    const previusPage = currentPage - 1 > 0 ? currentPage - 1 : 1;
    this._getMatches({ action: 'PREVIOUS', page: String(previusPage) });
  }

  goNextPage() {
    const currentPage = this.matchesResponse()?.data?.currentPage ?? 0;
    this._getMatches({ action: 'NEXT', page: String(currentPage + 1) });
  }

  onSearchInput(e: Event) {
    const inputElement = e.target as HTMLInputElement;
    const query = inputElement.value;
    if (query.length === 0) {
      this.searchedMatches.set(null);
      return;
    }
    // if (inputElement.value.length < 2) return;
    if (query.length >= 2) {
      this._searchSubject.next(query);
    }
  }

  onDateChange(event: any) {}

  onResetDates() {
    this.matchForm.controls.startDate.setValue(null);
    this.matchForm.controls.finishDate.setValue(null);
    this.matchForm.controls.dateTypeSelect.setValue('DATE');
    this._getMatches({ user_id: this._userState.me()?.id_user });
  }
}
