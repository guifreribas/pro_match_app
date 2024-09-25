import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CompetitionEditComponent } from '@app/components/competition/competition-edit/competition-edit.component';
import { CompetitionInitalizerComponent } from '@app/components/competition/competition-initalizer/competition-initalizer.component';
import { CompetitionViewComponent } from '@app/components/competition/competition-view/competition-view.component';
import { DashboardPanelLayoutComponent } from '@app/layouts/dashboard-panel-layout/dashboard-panel-layout.component';
import { Category } from '@app/models/category';
import {
  CompetitionsGetResponse,
  CompetitionWithDetails,
} from '@app/models/competition';
import { Organization } from '@app/models/organization';
import { CategoryService } from '@app/services/api_services/category.service';
import { CompetitionService } from '@app/services/api_services/competition.service';
import { OrganizationService } from '@app/services/api_services/organization.service';
import { CompetitionStateService } from '@app/services/global_states/competition-state.service';
import { UserStateService } from '@app/services/global_states/user-state.service';

type CompetitionViewState = 'VIEW' | 'EDIT' | 'INITIALIZE';

@Component({
  selector: 'app-comptetition',
  standalone: true,
  imports: [
    DashboardPanelLayoutComponent,
    CompetitionInitalizerComponent,
    CompetitionViewComponent,
    CompetitionEditComponent,
  ],
  templateUrl: './comptetition.component.html',
  styleUrl: './comptetition.component.scss',
})
export class ComptetitionComponent implements OnInit {
  public competitionId = '';
  public competitionViewState = signal<CompetitionViewState>('VIEW');
  public competitionsResponse = signal<CompetitionsGetResponse | null>(null);
  public competitions: CompetitionWithDetails[] = [];
  public organizations = signal<Organization[]>([]);
  public categories = signal<Category[]>([]);

  private _competitionService = inject(CompetitionService);
  private _competitionState = inject(CompetitionStateService);
  private _organizationService = inject(OrganizationService);
  private _categoryService = inject(CategoryService);
  private _userState = inject(UserStateService);
  private _route = inject(ActivatedRoute);
  private _hasFetchedCompetitions = false;
  private _hasFetchedOrganizations = false;
  private _hasFetchedCategories = false;

  constructor() {
    const idCompetition = this._route.snapshot.params['id'];
    effect(() => {
      const user = this._userState.me();
      if (user?.id_user && this._hasFetchedCompetitions === false) {
        this._competitionService
          .getCompetitions({
            user_id: user.id_user,
            includeCompetitionType: true,
            includeOrganization: true,
            includeCompetitionCategory: true,
            id_competition: idCompetition,
          })
          .subscribe({
            next: (res) => {
              console.log(res);
              console.log({ competitions: res.data.items });
              this.competitionsResponse.set(res);
              this._competitionState.setCompetition(res.data.items[0]);
              // this.competitions = res.data.items;
            },
            error: (err) => {
              console.log(err);
            },
          });
      }
      this._hasFetchedCompetitions = true;
    });

    effect(() => {
      const user = this._userState.me();
      if (user?.id_user && this._hasFetchedOrganizations === false) {
        this._organizationService
          .getOrganizations({
            user_id: this._userState.me()!.id_user,
          })
          .subscribe({
            next: (res) => {
              console.log('organizations Response!', res);
              this.organizations.set(res.data.items);
            },
            error: (err) => {
              console.log(err);
            },
          });
        this._hasFetchedOrganizations = true;
      }
    });

    effect(() => {
      const user = this._userState.me();
      if (user?.id_user && this._hasFetchedCategories === false) {
        this._categoryService
          .getCategories({ user_id: this._userState.me()!.id_user, limit: 100 })
          .subscribe({
            next: (res) => {
              console.log(res);
              this.categories.set(res.data.items);
            },
            error: (err) => {
              console.log(err);
            },
          });
        this._hasFetchedCategories = true;
      }
    });
  }

  ngOnInit(): void {
    const status = this._route.snapshot.queryParams['status'];
    this.competitionViewState.set(status);
  }
}
