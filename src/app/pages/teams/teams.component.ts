import {
  AfterViewInit,
  Component,
  effect,
  inject,
  OnInit,
  signal,
  WritableSignal,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { AsideComponent } from '@app/components/organism/aside/aside.component';
import { CreateTeamModalComponent } from '@app/components/team/create-team-modal/create-team-modal.component';
import { DashboardPanelLayoutComponent } from '@app/layouts/dashboard-panel-layout/dashboard-panel-layout.component';
import { GetTeamsParams, Team, TeamsGetResponse } from '@app/models/team';
import { TeamService } from '@app/services/api_services/team.service';
import { initFlowbite } from 'flowbite';
import dayjs from 'dayjs';
import { config } from '@app/config/config';
import { UserStateService } from '@app/services/global_states/user-state.service';
import {
  debounceTime,
  distinctUntilChanged,
  firstValueFrom,
  Observable,
  switchMap,
} from 'rxjs';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { getAllResponse } from '@app/models/api';
import { TeamStateService } from '@app/services/global_states/team-state.service';

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DashboardPanelLayoutComponent,
    RouterModule,
    CreateTeamModalComponent,
    AsideComponent,
  ],
  templateUrl: './teams.component.html',
  styleUrl: './teams.component.scss',
})
export class TeamsComponent implements OnInit, AfterViewInit {
  public teamsResponse = signal<TeamsGetResponse | null>(null);
  public page = 1;
  public createdAt: Date | null = null;
  public dayjs = dayjs;
  public IMG_URL = config.IMG_URL;
  public searchInput = new FormControl('');
  public teams$!: Observable<getAllResponse<Team>>;

  public _teamState = inject(TeamStateService);

  private _teamService = inject(TeamService);
  private _userState = inject(UserStateService);
  private _hasFetchedTeams = false;
  private _http = inject(HttpClient);

  constructor() {
    effect(() => {
      const user = this._userState.me();
      if (user?.id_user && this._hasFetchedTeams === false) {
        this.getTeams({ user_id: user.id_user, page: '1' });
        this.reInitFlowbite();
        this._hasFetchedTeams = true;
      }
    });
  }

  async getTeams(
    params: Partial<GetTeamsParams>
  ): Promise<getAllResponse<Team>> {
    const response = await firstValueFrom(this._teamService.getTeams(params));
    this.teamsResponse.set(response);
    this._teamState.setTeams(response.data.items);
    return response;
  }

  ngOnInit(): void {
    this.searchInput.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((query) => {
          const params: Partial<GetTeamsParams> = {
            user_id: this._userState.me()?.id_user,
            page: '1',
            ...(query && { q: query }),
          };
          return this.getTeams(params);
        })
      )
      .subscribe((res) => {
        this.teamsResponse.set(res);
        this._teamState.setTeams(res.data.items);
      });
  }

  ngAfterViewInit(): void {
    this.reInitFlowbite();
  }

  goOnPage(page: number) {
    const userId = this._userState.me()?.id_user;
    if (!userId) return;
    this.getTeams({ user_id: userId, page: page.toString() });
  }

  goPreviousPage() {
    const currentPage = this.teamsResponse()?.data?.currentPage ?? 0;
    const previusPage = currentPage - 1 > 0 ? currentPage - 1 : 1;
    this.goOnPage(previusPage);
  }

  goNextPage() {
    const currentPage = this.teamsResponse()?.data?.currentPage ?? 0;
    if (currentPage === this.teamsResponse()?.data?.totalPages) return;
    this.goOnPage(currentPage + 1);
  }

  reInitFlowbite() {
    setTimeout(() => {
      initFlowbite();
    }, 100);
  }
}
