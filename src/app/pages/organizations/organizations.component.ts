import { Component } from '@angular/core';
import { DashboardPanelLayoutComponent } from '@app/layouts/dashboard-panel-layout/dashboard-panel-layout.component';

@Component({
  selector: 'app-organizations',
  standalone: true,
  imports: [DashboardPanelLayoutComponent],
  templateUrl: './organizations.component.html',
  styleUrl: './organizations.component.scss',
})
export class OrganizationsComponent {}
