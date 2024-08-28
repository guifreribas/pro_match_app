import {
  Component,
  Input,
  WritableSignal,
  OnInit,
  inject,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { config } from '@app/config/config';
import { Player } from '@app/models/player';
import { TeamPlayer, TeamPlayerWithDetails } from '@app/models/team-player';
import { TeamPlayerService } from '@app/services/api_services/team-player.service';
import { PlayerViewState } from '@app/types/player';
import { signal } from '@angular/core';

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

  private _teamPlayersService = inject(TeamPlayerService);

  ngOnInit(): void {
    this._teamPlayersService.getTeamPlayers().subscribe({
      next: (res) => {
        console.log(res);
        this.teamPlayers.set(res.data.items);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
}
