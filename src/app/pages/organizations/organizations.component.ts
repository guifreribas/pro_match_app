import { CommonModule } from '@angular/common';
import {
  Component,
  effect,
  inject,
  ViewChild,
  WritableSignal,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { CreateOrganizationModalComponent } from '@app/components/organization/create-organization-modal/create-organization-modal.component';
import { config } from '@app/config/config';
import { DashboardPanelLayoutComponent } from '@app/layouts/dashboard-panel-layout/dashboard-panel-layout.component';
import { Organization } from '@app/models/organization';
import { OrganizationService } from '@app/services/api_services/organization.service';
import { OrganizationsGetResponse } from '@app/models/organization';
import { signal } from '@angular/core';
import { initFlowbite, Modal } from 'flowbite';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  Subject,
  switchMap,
} from 'rxjs';
import { GlobalModalService } from '@app/services/global-modal.service';
import { GlobalActionModalService } from '@app/services/global-action-modal.service';
import { UserStateService } from '@app/services/global_states/user-state.service';

type Action = 'NEXT' | 'PREVIOUS' | 'GO_ON_PAGE';

interface GetOrganizationsParams {
  q?: string;
  page?: string;
  user_id?: number;
  action: Action;
}

@Component({
  selector: 'app-organizations',
  standalone: true,
  imports: [
    DashboardPanelLayoutComponent,
    CreateOrganizationModalComponent,
    RouterModule,
    CommonModule,
  ],
  templateUrl: './organizations.component.html',
  styleUrl: './organizations.component.scss',
})
export class OrganizationsComponent {
  public imgUrl = config.IMG_URL;
  public organizations: WritableSignal<Organization[]> = signal([]);
  public page = 1;
  public organizationsResponse: WritableSignal<OrganizationsGetResponse | null> =
    signal(null);
  public searchedOrganizations = signal<OrganizationsGetResponse | null>(null);

  private _organizationService = inject(OrganizationService);
  private _searchSubject = new Subject<string>();
  private _globalModalService = inject(GlobalModalService);
  private _globalActionModalService = inject(GlobalActionModalService);
  private _userState = inject(UserStateService);
  private _hasFetchedOrganizations = false;

  constructor() {
    this._searchSubject
      .pipe(
        debounceTime(200),
        distinctUntilChanged(),
        switchMap((query) =>
          this._organizationService
            .getOrganizations({
              user_id: this._userState.me()!.id_user,
              q: query,
            })
            .pipe(
              catchError((error) => {
                console.log(error);
                return [];
              })
            )
        )
      )
      .subscribe((res) => {
        console.log(res);
        this.searchedOrganizations.set(res);
      });

    effect(() => {
      const user = this._userState.me();
      if (user?.id_user && this._hasFetchedOrganizations === false) {
        this._getOrganizations({ user_id: user.id_user });
        this._hasFetchedOrganizations = true;
      }
    });
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      initFlowbite();
    }, 100);
  }

  private _getOrganizations({
    action = 'GO_ON_PAGE',
    page = '1',
  }: Partial<GetOrganizationsParams>) {
    this._organizationService
      .getOrganizations({ user_id: this._userState.me()!.id_user, page })
      .subscribe({
        next: (res) => {
          console.log(res);
          console.log({ organizations: res.data.items });
          this.organizationsResponse.set(res);
          this.organizations.set(res.data.items);
        },
        error: (err) => {
          console.log(err);
        },
      });
  }

  goOnPage(page: number) {
    this._getOrganizations({ action: 'GO_ON_PAGE', page: page.toString() });
    this.reInitFlowbite();
  }

  goPreviousPage() {
    const currentPage = this.organizationsResponse()?.data?.currentPage ?? 0;
    const previusPage = currentPage - 1 > 0 ? currentPage - 1 : 1;
    this._getOrganizations({ action: 'PREVIOUS', page: String(previusPage) });
    this.reInitFlowbite();
  }

  goNextPage() {
    const currentPage = this.organizationsResponse()?.data?.currentPage ?? 0;
    this._getOrganizations({ action: 'NEXT', page: String(currentPage + 1) });
    this.reInitFlowbite();
  }

  onSearchInput(e: Event) {
    const inputElement = e.target as HTMLInputElement;
    const query = inputElement.value;
    if (query.length === 0) {
      this.searchedOrganizations.set(null);
      return;
    }
    // if (inputElement.value.length < 2) return;
    if (query.length >= 2) {
      this._searchSubject.next(query);
    }
  }

  reInitFlowbite() {
    setTimeout(() => {
      initFlowbite();
    }, 100);
  }

  handleDeleteOrganization(organization: Organization) {
    this._globalActionModalService.openModal({
      title: '¿Estás seguro?',
      message: `Estás seguro que quieres eliminar el centro ${organization.name}?`,
      actionButtonMessage: 'Eliminar',
      cancelButtonMessage: 'Cancelar',
      action: () => this.deleteOrganization(organization.id_organization),
    });
  }

  deleteOrganization(id: number): any {
    this._organizationService.deleteOrganization(id).subscribe({
      next: (res) => {
        console.log(res);
        this.organizations.update((prev) =>
          prev.filter((organization) => organization.id_organization !== id)
        );
        this._globalModalService.openModal('Centro eliminado', '');
      },
      error: (err) => {
        console.log(err);
        this._globalModalService.openModal(
          '¡Opss, lo lamento!',
          'Ha ocurrido un error vuelve a intentarlo'
        );
      },
    });
  }
}
