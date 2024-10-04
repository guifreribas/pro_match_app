import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  effect,
  HostListener,
  inject,
  signal,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { CreateCompetitionModalComponent } from '@app/components/competition/create-competition-modal/create-competition-modal.component';
import { CompetitionTypes } from '@app/config/constants';
import { DashboardPanelLayoutComponent } from '@app/layouts/dashboard-panel-layout/dashboard-panel-layout.component';
import {
  Competition,
  CompetitionsGetResponse,
  CompetitionWithDetails,
  GetCompetitionsParams,
} from '@app/models/competition';
import { Organization } from '@app/models/organization';
import { CompetitionService } from '@app/services/api_services/competition.service';
import { OrganizationService } from '@app/services/api_services/organization.service';
import { UserStateService } from '@app/services/global_states/user-state.service';
import { initFlowbite } from 'flowbite';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-competitions',
  standalone: true,
  imports: [
    DashboardPanelLayoutComponent,
    CreateCompetitionModalComponent,
    RouterModule,
    CommonModule,
  ],
  templateUrl: './competitions.component.html',
  styleUrl: './competitions.component.scss',
})
export class CompetitionsComponent {
  public popoverPosition = signal('bottom');
  public competitionsResponse = signal<CompetitionsGetResponse | null>(null);
  public competitions: CompetitionWithDetails[] = [];
  public organizations = signal<Organization[]>([]);
  public competitionType = {
    LEAGUE: 'Liga',
    TOURNAMENT: 'Copa',
  };

  public competitionFormatMap = {
    SINGLE_ROUND: 'Sólo ida',
    DOUBLE_ROUND: 'Doble vuelta',
    KNOCKOUT: 'Eliminatorias',
    KNOCKOUT_SINGLE_ROUND: 'Liguilla una vuelta más eliminatorias',
    KNOCKOUT_DOUBLE_ROUND: 'Liguilla dos vueltas más eliminatorias',
  };

  private _hasFetchedCompetitions = false;
  private _competitionService = inject(CompetitionService);
  private _organizationService = inject(OrganizationService);
  private _userState = inject(UserStateService);
  private _genderMap: { [key: string]: string } = {
    MALE: 'Masculino',
    FEMALE: 'Femenino',
    OTHER: 'Otro',
  };

  constructor() {
    effect(() => {
      const user = this._userState.me();
      if (user?.id_user && this._hasFetchedCompetitions === false) {
        this._competitionService
          .getCompetitions({
            user_id: user.id_user,
            includeCompetitionType: true,
            includeOrganization: true,
            includeCompetitionCategory: true,
            page: '1',
          })
          .subscribe({
            next: (res) => {
              console.log(res);
              console.log({ competitions: res.data.items });
              this.competitionsResponse.set(res);
              this.competitions = res.data.items;
            },
            error: (err) => {
              console.log(err);
            },
          });
      }
      this._hasFetchedCompetitions = true;
    });
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.reInitFlowbite();
  }

  reInitFlowbite() {
    setTimeout(() => {
      initFlowbite();
    }, 100);
  }

  async getCompetitions(params: Partial<GetCompetitionsParams>) {
    const response = await firstValueFrom(
      this._competitionService.getCompetitions(params)
    );
    this.competitionsResponse.set(response);
    this.competitions = response.data.items;
  }

  onCreateCompetitionModal() {
    this._organizationService
      .getOrganizations({
        user_id: this._userState.me()!.id_user,
      })
      .subscribe({
        next: (res) => {
          console.log('organizations', res);
          this.organizations.set(res.data.items);
        },
        error: (err) => {
          console.log(err);
        },
      });
  }

  getGender(gender: string = 'Otro') {
    return this._genderMap[gender] || 'Otro';
  }

  @HostListener('window:resize', ['$event'])
  onResize(event?: Event): void {
    const screenWidth = window.innerWidth;
    const isSmallScreen = screenWidth < 768;
    if (isSmallScreen) {
      this.popoverPosition.set('bottom');
    } else {
      this.popoverPosition.set('left');
    }
  }

  getRowClass(competition: CompetitionWithDetails) {
    return { 'bg-gray-100': !competition.is_initialized };
  }

  goOnPage(page: number) {
    this.getCompetitions({
      user_id: this._userState.me()?.id_user,
      includeCompetitionType: true,
      includeOrganization: true,
      includeCompetitionCategory: true,
      page: page.toString(),
    });
  }

  goPreviousPage() {
    const currentPage = this.competitionsResponse()?.data?.currentPage ?? 0;
    const previusPage = currentPage - 1 > 0 ? currentPage - 1 : 1;
    this.goOnPage(previusPage);
  }

  goNextPage() {
    const currentPage = this.competitionsResponse()?.data?.currentPage ?? 0;
    if (currentPage === this.competitionsResponse()?.data?.totalPages) return;
    this.goOnPage(currentPage + 1);
  }
}
