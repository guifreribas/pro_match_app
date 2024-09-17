import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatchEditComponent } from '@app/components/match/match-edit/match-edit.component';
import { DashboardPanelLayoutComponent } from '@app/layouts/dashboard-panel-layout/dashboard-panel-layout.component';
import { MatchService } from '@app/services/api_services/match.service';

@Component({
  selector: 'app-match',
  standalone: true,
  imports: [DashboardPanelLayoutComponent, MatchEditComponent],
  templateUrl: './match.component.html',
  styleUrl: './match.component.scss',
})
export class MatchComponent {
  private _matchService = inject(MatchService);
  private _route = inject(ActivatedRoute);

  constructor() {}

  ngOnInit(): void {
    const matchId = this._route.snapshot.params['id'];
    this._matchService.getMatches({ id_match: matchId }).subscribe({
      next: (res) => {
        console.log(res);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
}
