import { Component, Input, WritableSignal } from '@angular/core';
import { config } from '@app/config/config';
import { Organization } from '@app/models/organization';

@Component({
  selector: 'app-organization-view',
  standalone: true,
  imports: [],
  templateUrl: './organization-view.component.html',
  styleUrl: './organization-view.component.scss',
})
export class OrganizationViewComponent {
  @Input() organization!: WritableSignal<Organization | null>;
  @Input() organizationViewState!: WritableSignal<string>;

  public imgUrl: string = config.IMG_URL;
}
