import { Component, inject, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PlayerEditComponent } from '@app/components/player/player-edit/player-edit.component';
import { PlayerViewComponent } from '@app/components/player/player-view/player-view.component';
import { config } from '@app/config/config';
import { DashboardPanelLayoutComponent } from '@app/layouts/dashboard-panel-layout/dashboard-panel-layout.component';
import { Player } from '@app/models/player';
import { PlayerService } from '@app/services/api_services/player.service';
import { PlayerViewState } from '@app/types/player';
import { getYears } from '@app/utils/utils';

@Component({
  selector: 'app-player',
  standalone: true,
  imports: [
    DashboardPanelLayoutComponent,
    PlayerViewComponent,
    PlayerEditComponent,
  ],
  templateUrl: './player.component.html',
  styleUrl: './player.component.scss',
})
export class PlayerComponent {
  public imgUrl = config.IMG_URL;
  public player = signal<Player | null>(null);
  public playerId: number | null = null;
  public playerYears: number | null = null;
  public playerViewState = signal<PlayerViewState>('VIEW');
  public _isEditing = false;

  private _playerService = inject(PlayerService);
  private _route = inject(ActivatedRoute);

  ngOnInit(): void {
    this.playerId = this._route.snapshot.params['id'];
    this._isEditing = this._route.snapshot.queryParams['edit'];
    if (this._isEditing) this.playerViewState.set('EDIT');
    if (this.playerId) {
      this._playerService.getPlayer(this.playerId).subscribe({
        next: (res) => {
          const playerYears = getYears(new Date(res.data.birthday));
          console.log(playerYears);
          this.player.set(res.data);
          this.playerYears = playerYears;
        },
        error: (err) => {
          console.log(err);
        },
      });
    }
  }
}
