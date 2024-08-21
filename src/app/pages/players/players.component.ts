import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  OnInit,
  signal,
  ViewChild,
  WritableSignal,
} from '@angular/core';
import { DashboardPanelLayoutComponent } from '../../layouts/dashboard-panel-layout/dashboard-panel-layout.component';
import { RouterModule } from '@angular/router';
import { initFlowbite } from 'flowbite';
import { CreatePlayerModalComponent } from '@app/components/players/create-player-modal/create-player-modal.component';
import { AsideComponent } from '../../components/organism/aside/aside.component';
import { PlayerService } from '@app/services/api_services/player.service';
import { Player, PlayersGetResponse } from '@app/models/player';
import { CommonModule } from '@angular/common';
import { config } from '@app/config/config';

@Component({
  selector: 'app-players',
  standalone: true,
  imports: [
    DashboardPanelLayoutComponent,
    RouterModule,
    CreatePlayerModalComponent,
    AsideComponent,
    CommonModule,
  ],
  templateUrl: './players.component.html',
  styleUrl: './players.component.scss',
})
export class PlayersComponent implements OnInit, AfterViewInit {
  private _playerService = inject(PlayerService);
  public playersResponse: WritableSignal<PlayersGetResponse | null> =
    signal(null);
  public players: Player[] = [];
  public imgUrl = config.IMG_URL;

  ngOnInit(): void {
    this._playerService.getPlayers().subscribe({
      next: (res) => {
        console.log(res);
        console.log({ players: res.data.items });
        // this.playersResponse = res;
        this.playersResponse.set(res);
        this.players = res.data.items;
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  ngAfterViewInit(): void {
    initFlowbite();
  }
}
