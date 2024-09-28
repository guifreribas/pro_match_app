import { CommonModule } from '@angular/common';
import {
  Component,
  effect,
  inject,
  Input,
  WritableSignal,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Goal } from '@app/models/goal';
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
import { firstValueFrom } from 'rxjs';

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
export class AddGoalComponent {
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
  private _globalModalService = inject(GlobalModalService);

  constructor() {
    effect(() => {
      const matchData = this._matchState.match();
      if (matchData) {
        this.localTeam = matchData.localTeam;
        this.visitorTeam = matchData.visitorTeam;
        this.localPlayers = matchData.localPlayers;
        this.visitorPlayers = matchData.visitorPlayers;
        this.goals = matchData.goals;

        this.goalForm.controls.team.setValue(String(this.localTeam?.id_team));
      }
    });

    this.goalForm.controls.team.valueChanges.subscribe((teamId) => {
      const localTeamId = String(this.localTeam?.id_team);
      this.whatTeamIsSelected =
        teamId === localTeamId ? 'LOCAL_TEAM' : 'VISITOR_TEAM';
      this.goalForm.controls.player.setValue('');
    });
  }

  async onSubmit(e: Event) {
    e.preventDefault();

    const { minute, part, player, team } = this.goalForm.value;
    const match = this._matchState.match();
    const matchGoals = match?.goals || [];
    const localTeamId = this.localTeam?.id_team ?? 0;
    const visitorTeamId = this.visitorTeam?.id_team ?? 0;
    const hasLocalTeamScored = Number(team) === localTeamId;

    try {
      //Create goal
      const createGoalResponse = await firstValueFrom(
        this._goalService.createGoal({
          minute: minute,
          part: part,
          player_id: Number(player),
          team_id: Number(team),
          match_id: this._matchState.match()?.match.id_match,
          user_id: this._userState.me()?.id_user,
        })
      );

      this._matchState.updateMatch({
        ...match,
        goals: [...matchGoals, createGoalResponse.data],
      });

      const calculateGoals = (teamId: number, hasScored: boolean) => {
        const previousGoals = matchGoals.filter(
          (goal) => goal.team_id === teamId
        );
        console.log({ previousGoals });
        return hasScored ? previousGoals.length + 1 : previousGoals.length;
      };
      const localTeamGoals = calculateGoals(localTeamId, hasLocalTeamScored);
      const visitorTeamGoals = calculateGoals(
        visitorTeamId,
        hasLocalTeamScored
      );

      const competitionId = match?.match.competition.id_competition;
      if (competitionId && localTeamId && visitorTeamId) {
        //Get Id and Update Local Team Standings
        const standingsLocalTeam = await this.getStandings(localTeamId, match);
        const standingLocalTeam = standingsLocalTeam.data.items[0];
        const standingIdLocalTeam = standingLocalTeam.id_standings;
        if (!standingIdLocalTeam) return;
        this._standingsService.updateStanding(
          { goals_for: localTeamGoals, goals_against: visitorTeamGoals },
          standingIdLocalTeam
        );
        //Get Id and Update Visitor Team Standings
        const standingsVisitorTeam = await this.getStandings(
          visitorTeamId,
          match
        );
        const standingVisitorTeam = standingsVisitorTeam.data.items[0];
        const standingIdVisitorTeam = standingVisitorTeam.id_standings;
        if (!standingIdVisitorTeam) return;
        this._standingsService.updateStanding(
          { goals_for: visitorTeamGoals, goals_against: localTeamGoals },
          standingIdVisitorTeam
        );
      }

      console.log({ localTeamGoals, visitorTeamGoals });

      const playerName = this.getNameOfPlayer(
        Number(this.goalForm.value.player)
      );
      this._globalModalService.openModal(
        'Gol en el campo!',
        `Ha marcado ${playerName}!`
      );
    } catch (error) {
      console.error(error);
      this._globalModalService.openModal(
        'No ha habido gol!',
        'Ha ocurrido un error. Prueba de nuevo!'
      );
    }
  }

  async getStandings(teamId: number, match: MatchCompletedData) {
    return await firstValueFrom(
      this._standingsService.getStandings({
        competition_id: match?.match.competition.id_competition,
        team_id: teamId,
      })
    );
  }

  getNameOfPlayer(playerId: number) {
    const allMatchPlayers = [...this.localPlayers, ...this.visitorPlayers];
    const player = allMatchPlayers.find(
      (player) => player.player_id === playerId
    );
    return player?.player?.name;
  }

  onCancel(e: Event) {
    e.preventDefault();
    this.whichFormIsActive.set(null);
  }
}
