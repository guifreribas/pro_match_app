import {
  Component,
  Input,
  WritableSignal,
  OnInit,
  inject,
  OnChanges,
} from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { config } from '@app/config/config';
import { TeamPlayerWithDetails } from '@app/models/team-player';
import { TeamPlayerService } from '@app/services/api_services/team-player.service';
import { PlayerViewState } from '@app/types/player';
import { signal } from '@angular/core';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  Subject,
  switchMap,
} from 'rxjs';
import { Player } from '@app/models/player';
import { initFlowbite } from 'flowbite';

@Component({
  selector: 'app-player-view',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './player-view.component.html',
  styleUrl: './player-view.component.scss',
})
export class PlayerViewComponent implements OnInit {
  @Input() player!: Player | null;
  @Input() playerYears!: number | null;
  @Input() playerViewState!: WritableSignal<PlayerViewState>;
  public imgUrl: string = config.IMG_URL;
  public teamPlayers = signal<TeamPlayerWithDetails[]>([]);
  public searchedTeamPlayers = signal<TeamPlayerWithDetails[] | null>(null);

  private _teamPlayersService = inject(TeamPlayerService);
  private _searchSubject = new Subject<string>();
  private _route = inject(ActivatedRoute);

  ngOnInit(): void {
    const playerId = this._route.snapshot.params['id'];
    this._teamPlayersService.getTeamPlayers({ player_id: playerId }).subscribe({
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
          this._teamPlayersService.getTeamPlayers({ q: query }).pipe(
            catchError((error) => {
              console.log(error);
              return [];
            })
          )
        )
      )
      .subscribe((res) => {
        console.log(res);
        this.searchedTeamPlayers.set(res.data.items);
      });
  }

  onSearchInput(e: Event) {
    const inputElement = e.target as HTMLInputElement;
    const query = inputElement.value;
    if (query.length === 0) {
      this.searchedTeamPlayers.set(null);
      return;
    }
    // if (inputElement.value.length < 2) return;
    if (query.length >= 2) {
      this._searchSubject.next(query);
    }
  }
}
