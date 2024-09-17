import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DashboardPanelLayoutComponent } from '@app/layouts/dashboard-panel-layout/dashboard-panel-layout.component';
import { MatchService } from '@app/services/api_services/match.service';

@Component({
  selector: 'app-match-edit',
  standalone: true,
  imports: [],
  templateUrl: './match-edit.component.html',
  styleUrl: './match-edit.component.scss',
})
export class MatchEditComponent {}
