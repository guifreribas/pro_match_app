import {
  Component,
  inject,
  Input,
  signal,
  WritableSignal,
} from '@angular/core';
import { DashboardPanelLayoutComponent } from '../../../layouts/dashboard-panel-layout/dashboard-panel-layout.component';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Team } from '@app/models/team';
import { TeamViewState } from '@app/types/team';
import { config } from '@app/config/config';
import { CommonModule } from '@angular/common';
import { TeamPlayerService } from '@app/services/api_services/team-player.service';
import { TeamPlayerWithDetails } from '@app/models/team-player';
import { TeamService } from '@app/services/api_services/team.service';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  Subject,
  switchMap,
} from 'rxjs';
import { PlayerService } from '@app/services/api_services/player.service';
import { Player } from '@app/models/player';
import { UserStateService } from '@app/services/global_states/user-state.service';
import { Form, FormControl, ReactiveFormsModule } from '@angular/forms';
import { initFlowbite } from 'flowbite';

@Component({
  selector: 'app-team-view',
  standalone: true,
  imports: [
    DashboardPanelLayoutComponent,
    RouterModule,
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './team-view.component.html',
  styleUrl: './team-view.component.scss',
})
export class TeamViewComponent {
  @Input() team!: Team | null;
  @Input() teamViewState!: WritableSignal<TeamViewState>;

  public imgUrl: string = config.IMG_URL;
  public teamPlayers = signal<TeamPlayerWithDetails[]>([]);
  public searchedPlayers = signal<Player[] | null>(null);
  public playerSearchInput: FormControl = new FormControl('');
  public isPlayerCreatedSuccessfully = false;

  private _teamPlayersService = inject(TeamPlayerService);
  private _teamId: number | null = null;
  private _route = inject(ActivatedRoute);
  private _searchSubject = new Subject<string>();
  private _playerService = inject(PlayerService);
  private _userState = inject(UserStateService);

  ngOnInit(): void {
    setTimeout(() => {
      initFlowbite();
    }, 100);

    this._teamId = this._route.snapshot.params['id'] ?? null;
    const getTeamPlayersParams = {
      team_id: this._teamId,
      limit: 50,
    };
    this._teamPlayersService.getTeamPlayers(getTeamPlayersParams).subscribe({
      next: (res) => {
        console.log(res);
        this.teamPlayers.set(res.data.items);
      },
      error: (err) => {
        console.log(err);
      },
    });

    this._searchSubject
      .pipe(
        debounceTime(200),
        distinctUntilChanged(),
        switchMap((query) =>
          this._playerService.getPlayers({ q: query }).pipe(
            catchError((error) => {
              console.log(error);
              return [];
            })
          )
        )
      )
      .subscribe((res) => {
        console.log(res);
        this.searchedPlayers.set(res.data.items);
      });
  }

  onSearchInput(e: Event) {
    const inputElement = e.target as HTMLInputElement;
    const query = inputElement.value;
    if (query.length === 0) {
      this.searchedPlayers.set(null);
      return;
    }
    if (query.length >= 2) {
      this._searchSubject.next(query);
    }
  }

  handleAddPlayer(playerId: number) {
    if (!this._teamId) return;
    console.log({
      team_id: this._teamId,
      player_id: playerId,
      user_id: this._userState.me()!.id_user,
    });
    this._teamPlayersService
      .createTeamPlayer({
        team_id: this._teamId,
        player_id: playerId,
        user_id: this._userState.me()!.id_user,
      })
      .subscribe({
        next: (res) => {
          console.log(res);
          this.teamPlayers.set([...this.teamPlayers(), res.data]);
          console.log(this.teamPlayers());
          alert('Jugador añadido');
          this.playerSearchInput.setValue('');
          this.searchedPlayers.set(null);
          this.isPlayerCreatedSuccessfully = true;
        },
        error: (err) => {
          console.error(err);
          alert('Error al añadir jugador');
          throw err;
        },
      });
  }
}
