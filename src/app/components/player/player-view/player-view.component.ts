import { Component, Input, WritableSignal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { config } from '@app/config/config';
import { Player } from '@app/models/player';
import { PlayerViewState } from '@app/types/player';

@Component({
  selector: 'app-player-view',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './player-view.component.html',
  styleUrl: './player-view.component.scss',
})
export class PlayerViewComponent {
  @Input() player!: Player | null;
  @Input() playerYears!: number | null;
  @Input() playerViewState!: WritableSignal<PlayerViewState>;
  public imgUrl: string = config.IMG_URL;
}
