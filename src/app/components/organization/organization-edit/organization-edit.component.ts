import { CommonModule } from '@angular/common';
import {
  Component,
  effect,
  inject,
  Input,
  signal,
  WritableSignal,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { config } from '@app/config/config';
import {
  Organization,
  OrganizationsGetResponse,
} from '@app/models/organization';
import { ResourceCreateResponse } from '@app/models/resource';
import { GenericApiService } from '@app/services/api_services/generic-api.service';
import { OrganizationService } from '@app/services/api_services/organization.service';
import { ResourceService } from '@app/services/api_services/resource.service';
import { GlobalModalService } from '@app/services/global-modal.service';
import { UserStateService } from '@app/services/global_states/user-state.service';
import { Datepicker } from 'flowbite';
import { firstValueFrom, Subject } from 'rxjs';
import { updateResponse } from '../../../models/api';

@Component({
  selector: 'app-organization-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './organization-edit.component.html',
  styleUrl: './organization-edit.component.scss',
})
export class OrganizationEditComponent {
  @Input() organization!: WritableSignal<Organization | null>;

  public imgUrl = config.IMG_URL;
  public organizationForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    address: new FormControl('', [Validators.required]),
    logo: new FormControl('', []),
  });

  public isSubmitted = false;
  public isUpdatingOrganization = signal(false);
  public searchedOrganizations = signal<OrganizationsGetResponse | null>(null);
  public logoPreview = signal<string>('');

  private _organizationService = inject(OrganizationService);
  private _resourceService = inject(ResourceService);
  private _globalModalService = inject(GlobalModalService);
  private _userState = inject(UserStateService);
  private _avatar: File | null = null;
  private _isOrganizationFormSetted = false;

  constructor() {
    effect(() => {
      const organization = this.organization();
      if (organization && this._isOrganizationFormSetted === false) {
        this._isOrganizationFormSetted = true;
        const formControls = this.organizationForm.controls;
        formControls.name.setValue(organization.name);
        formControls.address.setValue(organization.address);
      }
    });
  }

  ngOnInit(): void {
    // this.organizationForm.controls.logo.valueChanges.subscribe((logo) => {
    //   console.log(logo);
    // });
  }

  async onSubmit(e: Event) {
    e.preventDefault();
    const organizationId = this.organization()?.id_organization;
    let logo;
    if (!organizationId) return;
    if (this._avatar && this._avatar.name) {
      logo = await this.createResource(this._avatar, this._avatar.name);
    }
    this.updateOrganization();
  }

  async updateOrganization(): Promise<updateResponse<Organization> | null> {
    const organizationId = this.organization()?.id_organization;
    if (!organizationId) return null;

    try {
      let logo = null;
      if (this._avatar && this._avatar.name) {
        const response = await this.createResource(
          this._avatar,
          this._avatar.name
        );
        if (response) logo = response?.data.name;
      }
      const dataToUpdate = this.getDataToUpdate(logo);
      const response = await firstValueFrom(
        this._organizationService.updateOrganization(
          dataToUpdate,
          organizationId
        )
      );
      return response;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  getDataToUpdate(logoToUpdate: string | null = null): Partial<Organization> {
    const dataToUpdate: Partial<Organization> = {};
    if (
      this.organizationForm.value.name !== this.organization()?.name &&
      this.organizationForm.value.name
    ) {
      dataToUpdate.name = this.organizationForm.value.name;
    }
    if (
      this.organizationForm.value.address !== this.organization()?.address &&
      this.organizationForm.value.address
    ) {
      dataToUpdate.address = this.organizationForm.value.address;
    }
    if (logoToUpdate) {
      dataToUpdate.logo = logoToUpdate;
    }
    return dataToUpdate;
  }

  async createResource(
    avatar: File,
    avatarName: string
  ): Promise<ResourceCreateResponse | null> {
    const formData = new FormData();
    formData.append('file', avatar, avatarName);

    try {
      return await firstValueFrom(
        this._resourceService.createResource(formData)
      );
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  onLogoChange(e: any) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      this.logoPreview.set(file.name as string);
      this._avatar = file;
    }
  }
}
