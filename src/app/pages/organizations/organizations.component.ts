import { CommonModule } from '@angular/common';
import { Component, inject, WritableSignal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CreateOrganizationModalComponent } from '@app/components/organization/create-organization-modal/create-organization-modal.component';
import { config } from '@app/config/config';
import { DashboardPanelLayoutComponent } from '@app/layouts/dashboard-panel-layout/dashboard-panel-layout.component';
import { Organization } from '@app/models/organization';
import { OrganizationService } from '@app/services/api_services/organization.service';
import { OrganizationsGetResponse } from '@app/models/organization';
import { signal } from '@angular/core';
import { initFlowbite } from 'flowbite';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  Subject,
  switchMap,
} from 'rxjs';

type Action = 'NEXT' | 'PREVIOUS' | 'GO_ON_PAGE';

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
  public organizations: Organization[] = [];
  public page = 1;
  public organizationsResponse: WritableSignal<OrganizationsGetResponse | null> =
    signal(null);
  public searchedOrganizations = signal<OrganizationsGetResponse | null>(null);

  private _organizationService = inject(OrganizationService);
  private _searchSubject = new Subject<string>();

  constructor() {
    this._searchSubject
      .pipe(
        debounceTime(200),
        distinctUntilChanged(),
        switchMap((query) =>
          this._organizationService.getOrganizations({ q: query }).pipe(
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
  }

  ngOnInit(): void {
    this._getOrganizations();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      initFlowbite();
    }, 100);
  }

  private _getOrganizations(action: Action = 'GO_ON_PAGE', page: string = '1') {
    this._organizationService.getOrganizations({ page }).subscribe({
      next: (res) => {
        console.log(res);
        console.log({ organizations: res.data.items });
        this.organizationsResponse.set(res);
        this.organizations = res.data.items;
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  goOnPage(page: number) {
    this._getOrganizations('GO_ON_PAGE', page.toString());
    this.reInitFlowbite();
  }

  goPreviousPage() {
    const currentPage = this.organizationsResponse()?.data?.currentPage ?? 0;
    const previusPage = currentPage - 1 > 0 ? currentPage - 1 : 1;
    this._getOrganizations('PREVIOUS', String(previusPage));
    this.reInitFlowbite();
  }

  goNextPage() {
    const currentPage = this.organizationsResponse()?.data?.currentPage ?? 0;
    this._getOrganizations('NEXT', String(currentPage + 1));
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
}