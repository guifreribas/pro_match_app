import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatepickerComponent } from '@app/components/atom/datepicker/datepicker.component';
import { config } from '@app/config/config';
import { getOneResponse } from '@app/models/api';
import { CompetitionWithDetails } from '@app/models/competition';
import { CompetitionTeam } from '@app/models/competitionTeam';
import { Team, TeamsGetResponse } from '@app/models/team';
import { CompetitionTeamService } from '@app/services/api_services/competition-team.service';
import { CompetitionService } from '@app/services/api_services/competition.service';
import { TeamService } from '@app/services/api_services/team.service';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  Subject,
  switchMap,
} from 'rxjs';

interface CompetitionDays {
  index: number;
  day: string[];
}

interface InitalizeCompetitionParams {
  teams: Team[];
  competitionDays: CompetitionDays[];
  startDate: Date;
  discardedDays: Date[];
}

@Component({
  selector: 'app-competition-initalizer',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink, DatepickerComponent],
  templateUrl: './competition-initalizer.component.html',
  styleUrl: './competition-initalizer.component.scss',
})
export class CompetitionInitalizerComponent implements OnInit {
  public imgUrl = config.IMG_URL;
  public competitionId = 0;
  public teamsSearchInput: FormControl = new FormControl('');
  public startDateInput: FormControl = new FormControl('');
  public discardedDatesInput: FormControl = new FormControl('');
  public competitionDaysInput: FormControl = new FormControl('');
  public competition = signal<getOneResponse<CompetitionWithDetails> | null>(
    null
  );
  public dynamicClasses: { [key: string]: boolean } = {};
  public searchedCompetition = signal<CompetitionWithDetails[] | null>(null);
  public searchedTeams = signal<TeamsGetResponse | null>(null);
  public teamsAdded = signal<Team[] | null>(null);
  public minDate = new Date(2024, 0, 1);
  public maxDate = new Date(2024, 11, 31);
  public startDate: Date = new Date();
  public discardedDays: Date[] = [];
  public competitionDays: CompetitionDays[] = [];
  public days = [
    ['Lunes', 'MONDAY'],
    ['Martes', 'TUESDAY'],
    ['Miércoles', 'WEDNESDAY'],
    ['Jueves', 'THURSDAY'],
    ['Viernes', 'FRIDAY'],
    ['Sábado', 'SATURDAY'],
    ['Domingo', 'SUNDAY'],
  ];

  private _competitionService = inject(CompetitionService);
  private _teamService = inject(TeamService);
  private _competitionTeamService = inject(CompetitionTeamService);
  private _route = inject(ActivatedRoute);
  private _searchSubject = new Subject<string>();

  constructor(private _formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.competitionId = this._route.snapshot.params['id'];
    this._competitionService.getCompetition(this.competitionId).subscribe({
      next: (res) => {
        console.log({ competitionWithDetails: res });
        this.competition.set(res);
      },
      error: (err) => {
        console.log(err);
      },
    });

    this._searchSubject
      .pipe(
        distinctUntilChanged(),
        debounceTime(200),
        switchMap((query) =>
          this._teamService.getTeams({ q: query }).pipe(
            catchError((error) => {
              console.log(error);
              return [];
            })
          )
        )
      )
      .subscribe((res) => {
        this.searchedTeams.set(res);
      });
  }

  onSearchInput(e: Event) {
    const inputElement = e.target as HTMLInputElement;
    const query = inputElement.value;
    if (query.length === 0) {
      this.searchedTeams.set(null);
      // this.mainContainer.nativeElement.style.minHeight = 'auto';
      return;
    }

    if (query.length >= 2) {
      this._searchSubject.next(query);
      // this.mainContainer.nativeElement.style.minHeight = '600px';
    }
  }

  onResetInput() {
    this.searchedTeams.set(null);
    this.teamsSearchInput.setValue('');
  }

  getDorsalControl(playerId: number): FormControl {
    return new FormControl('');
  }

  isInvalidDorsal(playerId: number): boolean {
    return false;
  }

  handleAddTeam(event: Event, team: Team) {
    event.stopPropagation();
    event.preventDefault();
    this.teamsAdded.update((prevTeams) => {
      if (!prevTeams) return [team];
      return [...prevTeams, team];
    });
    console.log(this.teamsAdded());
  }

  handleDeleteTeam(team: Team) {
    this.teamsAdded.update((prevTeams) => {
      if (!prevTeams) return [];
      return prevTeams.filter((prevTeam) => prevTeam.id_team !== team.id_team);
    });
  }

  handleDeletedDate(date: Date) {
    this.discardedDays = this.discardedDays.filter((discardedDate) => {
      return discardedDate !== date;
    });
  }

  onDateChange(event: any) {}

  onAddStartDate() {
    console.log(this.startDateInput.value);
    this.startDate = this.startDateInput.value;
  }

  onAddDiscardedDate() {
    console.log(this.discardedDatesInput.value);
    this.discardedDays.push(this.discardedDatesInput.value);
  }

  onAddCompetitionDays(event: Event, day: string[], index: number) {
    if (!event.target) return;
    const target = event.target as HTMLInputElement;
    if (target.checked) {
      this.competitionDays.push({ index, day: day });
      this.competitionDays = this.competitionDays.sort(
        (a, b) => a.index - b.index
      );
    } else {
      this.competitionDays = this.competitionDays.filter(
        (item) => item.index !== index
      );
    }
  }

  handleInitializeCompetition({
    teams,
    competitionDays,
    startDate,
    discardedDays,
  }: InitalizeCompetitionParams) {
    console.log({ teams, competitionDays, startDate, discardedDays });
  }
}
