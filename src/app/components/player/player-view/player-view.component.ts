import { Component, Input } from '@angular/core';
import { config } from '@app/config/config';
import { Player } from '@app/models/player';

@Component({
  selector: 'app-player-view',
  standalone: true,
  imports: [],
  templateUrl: './player-view.component.html',
  styleUrl: './player-view.component.scss',
})
export class PlayerViewComponent {
  @Input() player!: Player | null;
  @Input() playerYears!: number | null;
  public imgUrl: string = config.IMG_URL;
}
