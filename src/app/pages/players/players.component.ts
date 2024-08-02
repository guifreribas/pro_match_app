import { Component, OnInit } from '@angular/core';
import { DashboardPanelLayoutComponent } from '../../layouts/dashboard-panel-layout/dashboard-panel-layout.component';
import { RouterModule } from '@angular/router';
import { initFlowbite } from 'flowbite';
import { CreatePlayerModalComponent } from '@app/components/players/create-player-modal/create-player-modal.component';
import { AsideComponent } from '../../components/organism/aside/aside.component';

@Component({
  selector: 'app-players',
  standalone: true,
  imports: [
    DashboardPanelLayoutComponent,
    RouterModule,
    CreatePlayerModalComponent,
    AsideComponent,
  ],
  templateUrl: './players.component.html',
  styleUrl: './players.component.scss',
})
export class PlayersComponent implements OnInit {
  ngOnInit(): void {
    initFlowbite();
  }
}
