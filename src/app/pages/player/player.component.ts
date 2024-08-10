import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DashboardPanelLayoutComponent } from '@app/layouts/dashboard-panel-layout/dashboard-panel-layout.component';
import { Player } from '@app/models/player';
import { PlayerService } from '@app/services/api_services/player.service';
import { getYears } from '@app/utils/utils';

@Component({
  selector: 'app-player',
  standalone: true,
  imports: [DashboardPanelLayoutComponent],
  templateUrl: './player.component.html',
  styleUrl: './player.component.scss',
})
export class PlayerComponent {
  public player: Player | null = null;
  public playerId: number | null = null;
  public playerYears: number | null = null;
  private _playerService = inject(PlayerService);
  private _route = inject(ActivatedRoute);

  ngOnInit(): void {
    this.playerId = this._route.snapshot.params['id'];
    if (this.playerId) {
      this._playerService.getPlayer(this.playerId).subscribe({
        next: (res) => {
          const playerYears = getYears(new Date(res.data.birthday));
          console.log(playerYears);
          this.player = res.data;
          this.playerYears = playerYears;
        },
        error: (err) => {
          console.log(err);
        },
      });
    }
  }
}
