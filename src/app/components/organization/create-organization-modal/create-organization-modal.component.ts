import {
  ChangeDetectorRef,
  Component,
  inject,
  Input,
  signal,
  WritableSignal,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { config } from '@app/config/config';
import {
  Organization,
  OrganizationsCreateResponse,
  OrganizationsGetResponse,
} from '@app/models/organization';
import { ResourceCreateResponse } from '@app/models/resource';
import { GenericApiService } from '@app/services/api_services/generic-api.service';
import { OrganizationService } from '@app/services/api_services/organization.service';
import { UserStateService } from '@app/services/global_states/user-state.service';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  firstValueFrom,
  Subject,
  switchMap,
} from 'rxjs';
import { postResponse } from '@app/models/api';
import { ResourceService } from '@app/services/api_services/resource.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GlobalModalService } from '@app/services/global-modal.service';

@Component({
  selector: 'app-create-organization-modal',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './create-organization-modal.component.html',
  styleUrl: './create-organization-modal.component.scss',
})
export class CreateOrganizationModalComponent {
  @Input() organizations!: WritableSignal<Organization[]>;

  public imgUrl = config.IMG_URL;
  public organizationForm!: FormGroup;
  public isSubmitted = false;
  public isCreatingOrganization = signal(false);
  public searchedOrganizations = signal<OrganizationsGetResponse | null>(null);

  private _organizationService = inject(OrganizationService);
  private _resourceService = inject(ResourceService);
  private _searchSubject = new Subject<string>();
  private _genericService = inject(GenericApiService);
  private _globalModalService = inject(GlobalModalService);
  private _userState = inject(UserStateService);
  private _avatar: File | null = null;

  constructor(private fb: FormBuilder, private cdr: ChangeDetectorRef) {
    this.organizationForm = this.fb.group({
      name: new FormControl('', [Validators.required]),
      address: new FormControl('', [Validators.required]),
      logo: new FormControl('', []),
    });
  }

  ngOnInit(): void {
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
        console.log({ res });
        this.searchedOrganizations.set(res);
      });
  }

  async onSubmit(e: SubmitEvent) {
    e.preventDefault();
    this.isSubmitted = true;
    if (this.organizationForm.invalid) return;
    this.isCreatingOrganization.set(true);
    const organization: Organization = {
      ...this.organizationForm.value,
      user_id: this._userState.me()?.id_user,
    };
    let resource: ResourceCreateResponse | null = null;
    if (this._avatar) {
      resource = await this.createResource(this._avatar, this._avatar.name);
      console.log(resource);
      organization.logo = resource.data.name;
    }
    const organizationCreateResponse = await this.createOrganization(
      organization
    );
    console.log({ organizationCreateResponse });
    this.isCreatingOrganization.set(false);
    this.organizationForm.reset();
    this.organizations.set([...this.organizations(), organization]);
    this.isSubmitted = false;
    // this._globalModalService.openModal('Centro creado correctamente', '');
  }

  async createOrganization(
    organization: Organization
  ): Promise<postResponse<OrganizationsCreateResponse>> {
    try {
      return firstValueFrom(
        this._genericService
          .create<Organization, postResponse<OrganizationsCreateResponse>>(
            this._organizationService.apiUrl,
            organization
          )
          .pipe(
            catchError((err) => {
              console.log(err);
              this._globalModalService.openModal('Error', err.error.message);
              throw err;
            })
          )
      );
    } catch (error) {
      console.log(error);
      this._globalModalService.openModal(
        '¡Opss, lo lamento!',
        'Ha ocurrido un error vuelve a intentarlo'
      );
      throw error;
    }
  }

  async createResource(
    avatar: File,
    avatarName: string
  ): Promise<ResourceCreateResponse> {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', avatar, avatarName);
      this._resourceService.createResource(formData).subscribe({
        next: (res: ResourceCreateResponse) => {
          resolve(res);
        },
        error: (err) => {
          console.log(err);
          this.isCreatingOrganization.set(false);
          reject(err);
        },
      });
    });
  }

  onLogoChange(e: any) {
    if (e?.target?.files) {
      const file: File = e.target.files[0];
      this._avatar = file;
    }
  }
}
