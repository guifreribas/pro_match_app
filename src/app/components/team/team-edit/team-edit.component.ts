import { CommonModule } from '@angular/common';
import {
  Component,
  effect,
  ElementRef,
  inject,
  Input,
  signal,
  ViewChild,
  WritableSignal,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { config } from '@app/config/config';
import { updateResponse } from '@app/models/api';
import { Player } from '@app/models/player';
import { ResourceCreateResponse } from '@app/models/resource';
import { Team, TeamsGetResponse } from '@app/models/team';
import { TeamPlayerWithDetails } from '@app/models/team-player';
import { PlayerService } from '@app/services/api_services/player.service';
import { ResourceService } from '@app/services/api_services/resource.service';
import { TeamPlayerService } from '@app/services/api_services/team-player.service';
import { TeamService } from '@app/services/api_services/team.service';
import { GlobalModalService } from '@app/services/global-modal.service';
import { TeamPlayerStateService } from '@app/services/global_states/team-player-state.service';
import { TeamStateService } from '@app/services/global_states/team-state.service';
import { UserStateService } from '@app/services/global_states/user-state.service';
import { SpinnerService } from '@app/services/spinner.service';
import { TeamViewState } from '@app/types/team';
import { initFlowbite } from 'flowbite';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  firstValueFrom,
  Subject,
  switchMap,
} from 'rxjs';

@Component({
  selector: 'app-team-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './team-edit.component.html',
  styleUrl: './team-edit.component.scss',
})
export class TeamEditComponent {
  @Input() teamViewState!: WritableSignal<TeamViewState>;

  @ViewChild('mainContainer', { static: false }) mainContainer!: ElementRef;
  @ViewChild('searchedPlayersContainer', { static: false })
  public imgUrl = '';
  public searchedTeams = signal<TeamsGetResponse | null>(null);
  public teamPlayers = signal<TeamPlayerWithDetails[]>([]);
  public playerForms: { [key: string]: FormGroup } = {};
  public searchedPlayers = signal<Player[] | null>(null);
  public playerSearchInput: FormControl = new FormControl('');
  public isPlayerCreatedSuccessfully = false;
  public team = TeamStateService.activeTeam;
  public avatarImg: string = '';

  public teamForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    avatar: new FormControl('', []),
  });

  public isSubmitted = false;

  private _userState = inject(UserStateService);
  private _teamPlayerState = inject(TeamPlayerStateService);
  private _teamStateService = inject(TeamStateService);
  private _teamService = inject(TeamService);
  private _resourceService = inject(ResourceService);
  private _globalModalService = inject(GlobalModalService);
  private _avatar: File | null = null;
  private _teamPlayersService = inject(TeamPlayerService);
  private _spinnerService = inject(SpinnerService);
  private _teamId: number | null = null;
  private _route = inject(ActivatedRoute);
  private _searchSubject = new Subject<string>();
  private _playerService = inject(PlayerService);
  private _formBuilder = inject(FormBuilder);

  constructor() {
    effect(() => {
      const team = this.team();
      if (team) {
        const formControls = this.teamForm.controls;
        formControls.name.setValue(team.name);
        this.imgUrl = config.IMG_URL;
        this.avatarImg = this.imgUrl + team.avatar;
      }
    });
  }

  ngOnInit(): void {
    setTimeout(() => {
      initFlowbite();
    }, 100);

    this._teamId = this._route.snapshot.params['id'] ?? null;
    if (this._teamId) {
      const getTeamPlayersParams = {
        team_id: this._teamId,
        page: '1',
        limit: 50,
        sortBy: 'player_number',
        sortOrder: 'asc',
      };
      this._teamPlayersService.getTeamPlayers(getTeamPlayersParams).subscribe({
        next: (res) => {
          this.teamPlayers.set(res.data.items);
        },
        error: (err) => {
          console.log(err);
          throw err;
        },
      });
    }

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
        this.searchedPlayers.set(res.data.items);
        this.initPlayerForms(res.data.items);
      });
  }

  ngAfterViewInit(): void {}

  initPlayerForms(players: Player[]) {
    players.forEach((player) => {
      this.playerForms[player.id_player] = this._formBuilder.group({
        dorsal: [
          '',
          [Validators.required, Validators.min(1), Validators.max(99)],
        ],
      });
    });
  }

  async onSubmit(e: SubmitEvent) {
    e.preventDefault();
    this.isSubmitted = true;
    if (this.teamForm.invalid) return;
    this._spinnerService.setLoading(true);
    const team: Partial<Team> = {
      user_id: Number(this._userState.me()?.id_user),
    };
    const body: Partial<Team> = {
      name: this.teamForm.value.name as string,
    };
    let resource: ResourceCreateResponse | null = null;
    if (this._avatar) {
      resource = await this.createResource(this._avatar, this._avatar.name);
      body.avatar = resource.data.name;
    }
    const teamCreateResponse = await this.updateTeam(body);
    this._teamStateService.setActiveTeam(teamCreateResponse.data);
    this._spinnerService.setLoading(false);
    this._globalModalService.openModal('Equipo actualizado', '');

    // this.isCreatingTeam.set(false);
    // this.teamForm.reset();
  }

  async updateTeam(team: Partial<Team>): Promise<updateResponse<Team>> {
    try {
      return firstValueFrom(
        this._teamService.updateTeam(team, Number(this.team()?.id_team))
      );
    } catch (error) {
      console.log(error);
      this._spinnerService.setLoading(false);
      throw error;
    }
  }

  async createResource(
    avatar: File,
    avatarName: string
  ): Promise<ResourceCreateResponse> {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', avatar, avatarName);
      this._resourceService.createResource(formData).subscribe({
        next: (res: ResourceCreateResponse) => {
          resolve(res);
        },
        error: (err) => {
          console.log(err);
          // this.isCreatingTeam.set(false);
          reject(err);
        },
      });
    });
  }

  onSearchInput(e: Event) {
    const inputElement = e.target as HTMLInputElement;
    const query = inputElement.value;
    if (query.length === 0) {
      this.searchedPlayers.set(null);
      this.mainContainer.nativeElement.style.minHeight = 'auto';
      return;
    }

    if (query.length >= 2) {
      this._searchSubject.next(query);
      this.mainContainer.nativeElement.style.minHeight = '600px';
    }
  }

  handleAddPlayer(playerId: number) {
    if (!this._teamId) return;
    const playerForm = this.playerForms[playerId];
    if (playerForm.invalid) {
      playerForm.markAllAsTouched();
      return;
    }
    this._teamPlayersService
      .createTeamPlayer({
        team_id: this._teamId,
        player_id: playerId,
        user_id: this._userState.me()!.id_user,
        player_number: this.playerForms[playerId].value.dorsal,
      })
      .subscribe({
        next: (res) => {
          this.teamPlayers.set([...this.teamPlayers(), res.data]);
          this._globalModalService.openModal('Jugador/a añadido', '');
          this.playerSearchInput.setValue('');
          this.searchedPlayers.set(null);
          this.isPlayerCreatedSuccessfully = true;
        },
        error: (err) => {
          console.error(err);
          this._globalModalService.openModal('Error', err.error.message);
          throw err;
        },
      });
  }

  onAvatarChange(e: any) {
    if (e?.target?.files) {
      const file: File = e.target.files[0];
      this._avatar = file;
    }
  }

  getDorsalControl(playerId: number): FormControl {
    return this.playerForms[playerId].get('dorsal') as FormControl;
  }

  isInvalidDorsal(playerId: number): boolean {
    const control = this.getDorsalControl(playerId);
    return control.invalid && (control.dirty || control.touched);
  }

  handleDeletePlayer(e: Event, TeamPlayer: TeamPlayerWithDetails) {
    e.stopPropagation();
    this._teamPlayersService
      .deleteTeamPlayer(TeamPlayer.id_team_player)
      .subscribe({
        next: (res) => {
          this.teamPlayers.update((prev) =>
            prev.filter(
              (player) => player.id_team_player !== TeamPlayer.id_team_player
            )
          );
          this._globalModalService.openModal('Jugador/a eliminado', '');
        },
        error: (err) => {
          console.error(err);
          this._globalModalService.openModal('Error', err.error.message);
          throw err;
        },
      });
  }
}
