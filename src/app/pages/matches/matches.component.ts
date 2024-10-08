import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  effect,
  inject,
  signal,
} from '@angular/core';
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
  GetMatchesParams,
  Match,
  MatchStatus,
  MatchWithDetails,
} from '@app/models/match';
import { MatchService } from '@app/services/api_services/match.service';
import { UserStateService } from '@app/services/global_states/user-state.service';
import { initFlowbite } from 'flowbite';
import { Subject } from 'rxjs';
import { trigger, transition, style, animate } from '@angular/animations';

type DateFilterType = 'DATE' | 'RANGE_DATE';
type Action = 'NEXT' | 'PREVIOUS' | 'GO_ON_PAGE';

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
  animations: [
    trigger('enterLeave', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate(
          '0.2s ease-in-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
      transition(':leave', [
        style({ opacity: 1, transform: 'translateY(0)' }),
        animate(
          '0.2s ease-in-out',
          style({ opacity: 0, transform: 'translateY(-10px)' })
        ),
      ]),
    ]),
  ],
})
export class MatchesComponent implements AfterViewInit {
  public matchesResponse = signal<getAllResponse<MatchWithDetails> | null>(
    null
  );
  public matches = signal<MatchWithDetails[]>([]);
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
          dateAfter: startDate,
          dateBefore: finishDate,
        });
      }
    });
  }

  ngAfterViewInit(): void {
    this._reinitFlowbite();
  }

  private _reinitFlowbite() {
    setTimeout(() => {
      initFlowbite();
    }, 100);
  }

  private _getMatches(params?: Partial<GetMatchesParams>) {
    this._matechService.getMatches(params).subscribe({
      next: (res) => {
        this.matchesResponse.set(res);
        this.matches.set(res.data.items);
        this._reinitFlowbite();
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  goOnPage(page: number) {
    this._getMatches({
      page: page.toString(),
      user_id: this._userState.me()?.id_user,
    });
  }

  goPreviousPage() {
    const currentPage = this.matchesResponse()?.data?.currentPage ?? 0;
    if (currentPage === 1) return;
    const previusPage = currentPage - 1 > 0 ? currentPage - 1 : 1;
    this._getMatches({
      page: String(previusPage),
      user_id: this._userState.me()?.id_user,
    });
  }

  goNextPage() {
    const currentPage = this.matchesResponse()?.data?.currentPage ?? 0;
    if (currentPage === this.matchesResponse()?.data?.totalPages) return;
    this._getMatches({
      page: String(currentPage + 1),
      user_id: this._userState.me()?.id_user,
    });
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
