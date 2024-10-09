import { CommonModule } from '@angular/common';
import {
  Component,
  effect,
  inject,
  Input,
  OnInit,
  WritableSignal,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Goal, GoalPart } from '@app/models/goal';
import { MatchWithDetails } from '@app/models/match';
import { Team } from '@app/models/team';
import { TeamPlayerWithDetails } from '@app/models/team-player';
import { GoalService } from '@app/services/api_services/goal.service';
import { StandingsService } from '@app/services/api_services/standings.service';
import { GlobalModalService } from '@app/services/global-modal.service';
import {
  MatchCompletedData,
  MatchStateService,
} from '@app/services/global_states/match-state.service';
import { UserStateService } from '@app/services/global_states/user-state.service';
import { firstValueFrom, Subject, takeUntil } from 'rxjs';
import { VisitorTeam } from '../../../models/match';
import { SpinnerService } from '@app/services/spinner.service';

type FormType = 'GOAL' | 'CARD' | 'FOUL' | null;

interface UpdateStandingsParams {
  teamId: number;
  match: MatchCompletedData;
}

@Component({
  selector: 'app-add-goal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-goal.component.html',
  styleUrl: './add-goal.component.scss',
})
export class AddGoalComponent implements OnInit {
  @Input() whichFormIsActive!: WritableSignal<FormType>;
  public goalForm = new FormGroup({
    team: new FormControl('', [Validators.required]),
    player: new FormControl('', [Validators.required]),
    minute: new FormControl('', [Validators.required]),
    part: new FormControl('', [Validators.required]),
  });

  public localTeam: Team | null = null;
  public visitorTeam: Team | null = null;
  public localPlayers: TeamPlayerWithDetails[] = [];
  public visitorPlayers: TeamPlayerWithDetails[] = [];
  public goals: Goal[] = [];
  public whatTeamIsSelected = 'LOCAL_TEAM';

  private _userState = inject(UserStateService);
  private _goalService = inject(GoalService);
  private _matchState = inject(MatchStateService);
  private _standingsService = inject(StandingsService);
  private _globalModal = inject(GlobalModalService);
  private _spinner = inject(SpinnerService);
  private destroy$ = new Subject<void>();

  constructor() {
    this.setupEffects();
  }

  private setupEffects() {
    effect(() => {
      const { localTeam, visitorTeam } = this._matchState;
      if (localTeam) {
        this.localTeam = localTeam();
        this.goalForm.controls.team.setValue(String(this.localTeam?.id_team));
      }
      if (visitorTeam) {
        this.visitorTeam = visitorTeam();
      }
    });

    effect(() => {
      const localPlayers = this._matchState.localPlayers();
      const visitorPlayers = this._matchState.visitorPlayers();
      if (localPlayers) this.localPlayers = localPlayers;
      if (visitorPlayers) this.visitorPlayers = visitorPlayers;
    });

    effect(() => {
      const goals = this._matchState.goals();
      if (goals) this.goals = goals;
    });
  }

  ngOnInit(): void {
    this.goalForm.controls.team.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((teamId) => {
        const localTeamId = String(this.localTeam?.id_team);
        this.whatTeamIsSelected =
          teamId === localTeamId ? 'LOCAL_TEAM' : 'VISITOR_TEAM';
        this.goalForm.controls.player.setValue('');
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private _createGoalBody(): Goal {
    const { minute, part, player, team } = this.goalForm.value;
    const match = this._matchState.match();
    const match_id = match?.id_match ?? 0;
    const competition_id = match?.competition.id_competition ?? 0;
    const user_id = this._userState.me()?.id_user ?? 0;
    const goalBody: Goal = {
      minute: Number(minute),
      part: part as GoalPart,
      player_id: Number(player),
      team_id: Number(team),
      match_id,
      user_id,
      competition_id,
    };

    return goalBody;
  }

  async onAddGoal(e: Event) {
    e.preventDefault();

    const goalBody = this._createGoalBody();
    if (this.goalForm.invalid) {
      this._globalModal.openModal('Ha ocurrido un error', 'Intenta de nuevo');
      return;
    }

    try {
      //Create goal
      this._spinner.setLoading(true);
      const createGoalResponse = await firstValueFrom(
        this._goalService.createGoal(goalBody)
      );

      this._matchState.goals.update((prev) => {
        if (!prev) return prev;
        return [...prev, createGoalResponse.data];
      });

      // await this.updateTeamStandings(
      //   this.localTeam!.id_team!,
      //   this.visitorTeam!.id_team!,
      //   goalBody
      // );

      const playerName =
        this.getNameOfPlayer(Number(this.goalForm.value.player)) ??
        'Un jugador';

      this._globalModal.openModal(
        'Gol en el campo!',
        `Ha marcado ${playerName}!`
      );
    } catch (error) {
      console.error(error);
      this._globalModal.openModal(
        'No ha habido gol!',
        'Ha ocurrido un error. Prueba de nuevo!'
      );
    } finally {
      this._spinner.setLoading(false);
    }
  }

  private async updateTeamStandings(
    localTeamId: number,
    visitorTeamId: number,
    goalBody: Goal
  ) {
    const matchGoals = this._matchState.goals() || [];
    const hasLocalTeamScored = goalBody.team_id === localTeamId;
    const hasVisitorTeamScored = goalBody.team_id === visitorTeamId;

    const localTeamGoals = this._calculateGoals(
      localTeamId,
      matchGoals,
      hasLocalTeamScored
    );
    const visitorTeamGoals = this._calculateGoals(
      visitorTeamId,
      matchGoals,
      hasVisitorTeamScored
    );

    const match = this._matchState.match();

    const standingsLocalTeams = await this._getStandings(localTeamId);
    const standingVisitorTeams = await this._getStandings(visitorTeamId);
    const standingLocalTeam = standingsLocalTeams.data.items[0];
    const visitorLocalTeam = standingVisitorTeams.data.items[0];

    await this._updateStandings(
      standingLocalTeam.id_standings,
      localTeamGoals,
      visitorTeamGoals
    );
    await this._updateStandings(
      visitorLocalTeam.id_standings,
      visitorTeamGoals,
      localTeamGoals
    );
  }

  private _calculateGoals = (
    teamId: number,
    goals: Goal[],
    scoredByTeam: boolean
  ) => {
    return (
      goals.filter((goal) => goal.team_id === teamId).length +
      (scoredByTeam ? 1 : 0)
    );
  };

  private async _getStandings(teamId: number) {
    const match = this._matchState.match();
    return await firstValueFrom(
      this._standingsService.getStandings({
        competition_id: match?.competition.id_competition,
        user_id: this._userState.me()?.id_user,
        team_id: teamId,
      })
    );
  }

  private async _updateStandings(
    standingId: number,
    goalsFor: number,
    goalsAgainst: number
  ) {
    await firstValueFrom(
      this._standingsService.updateStanding(
        {
          goals_for: goalsFor,
          goals_against: goalsAgainst,
        },
        standingId
      )
    );
  }

  getNameOfPlayer(playerId: number | null) {
    if (!playerId) return 'Un jugador';
    const allMatchPlayers = [...this.localPlayers, ...this.visitorPlayers];
    const player = allMatchPlayers.find((player) => {
      console.log({ playerId, playerId2: player.player_id });
      return player.player_id === playerId;
    });
    return `${player?.player?.name} ${player?.player?.last_name}`;
  }

  onCancel(e: Event) {
    e.preventDefault();
    this.whichFormIsActive.set(null);
  }
}
