import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CompetitionInitalizerComponent } from '@app/components/competition/competition-initalizer/competition-initalizer.component';
import { DashboardPanelLayoutComponent } from '@app/layouts/dashboard-panel-layout/dashboard-panel-layout.component';
import { CompetitionWithDetails } from '@app/models/competition';
import { CompetitionService } from '@app/services/api_services/competition.service';
import { CompetitionStateService } from '@app/services/global_states/competition-state.service';

interface CompetitionViewState {
  VIEW: 'VIEW';
  EDIT: 'EDIT';
  INITIALIZE: 'INITIALIZE';
}

@Component({
  selector: 'app-comptetition',
  standalone: true,
  imports: [DashboardPanelLayoutComponent, CompetitionInitalizerComponent],
  templateUrl: './comptetition.component.html',
  styleUrl: './comptetition.component.scss',
})
export class ComptetitionComponent implements OnInit {
  public competitionId = '';
  public competition = signal<CompetitionWithDetails | null>(null);
  // public competitionViewState = signal<CompetitionViewState>('VIEW');

  private _competitionService = inject(CompetitionService);
  private _competitionState = inject(CompetitionStateService);
  private _route = inject(ActivatedRoute);
  private _isEditing = false;

  ngOnInit(): void {
    this.competitionId = this._route.snapshot.params['id'] || '';
    this._isEditing = this._route.snapshot.queryParams['edit'];
    if (this.competitionId) {
      this._competitionService
        .getCompetition(Number(this.competitionId))
        .subscribe({
          next: (res) => {
            this._competitionState.competitions.set(res);
          },
          error: (err) => {
            console.log(err);
          },
        });
    }
  }
}
