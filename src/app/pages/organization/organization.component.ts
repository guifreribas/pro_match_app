import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OrganizationEditComponent } from '@app/components/organization/organization-edit/organization-edit.component';
import { OrganizationViewComponent } from '@app/components/organization/organization-view/organization-view.component';
import { config } from '@app/config/config';
import { DashboardPanelLayoutComponent } from '@app/layouts/dashboard-panel-layout/dashboard-panel-layout.component';
import { Organization } from '@app/models/organization';
import { OrganizationService } from '@app/services/api_services/organization.service';

@Component({
  selector: 'app-organization',
  standalone: true,
  imports: [
    DashboardPanelLayoutComponent,
    OrganizationViewComponent,
    OrganizationEditComponent,
  ],
  templateUrl: './organization.component.html',
  styleUrl: './organization.component.scss',
})
export class OrganizationComponent {
  public imgUrl = config.IMG_URL;
  public organizationId: number | null = null;
  public organization = signal<Organization | null>(null);
  public organizationViewState = signal<string>('VIEW');
  public isEditing = false;

  private _route = inject(ActivatedRoute);
  private _organizationService = inject(OrganizationService);

  ngOnInit(): void {
    this.organizationId = this._route.snapshot.params['id'];
    if (this.organizationId) {
      this._organizationService.getOrganization(this.organizationId).subscribe({
        next: (res) => {
          console.log(res);
          this.organization.set(res.data);
        },
        error: (err) => {
          console.log(err);
        },
      });
    }

    const params = this._route.snapshot.queryParams;
    const isEdit = params['edit'] === 'true';
    const isView = params['view'] === 'true';

    if (isEdit) {
      this.organizationViewState.set('EDIT');
    } else if (isView) {
      this.organizationViewState.set('VIEW');
    }
  }
}
