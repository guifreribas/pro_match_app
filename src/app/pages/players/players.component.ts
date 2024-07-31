import { Component } from '@angular/core';
import { DashboardPanelLayoutComponent } from '../../layouts/dashboard-panel-layout/dashboard-panel-layout.component';

@Component({
  selector: 'app-players',
  standalone: true,
  imports: [DashboardPanelLayoutComponent],
  templateUrl: './players.component.html',
  styleUrl: './players.component.scss',
})
export class PlayersComponent {}
