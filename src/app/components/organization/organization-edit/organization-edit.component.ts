import { Component, Input, WritableSignal } from '@angular/core';
import { Organization } from '@app/models/organization';

@Component({
  selector: 'app-organization-edit',
  standalone: true,
  imports: [],
  templateUrl: './organization-edit.component.html',
  styleUrl: './organization-edit.component.scss',
})
export class OrganizationEditComponent {
  @Input() organization!: WritableSignal<Organization | null>;
}
