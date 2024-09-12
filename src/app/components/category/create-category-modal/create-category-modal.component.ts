import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  inject,
  Input,
  OnChanges,
  signal,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { config } from '@app/config/config';
import { Category, Gender } from '@app/models/category';
import {
  Organization,
  OrganizationsGetResponse,
} from '@app/models/organization';
import { CategoryService } from '@app/services/api_services/category.service';
import { GenericApiService } from '@app/services/api_services/generic-api.service';
import { OrganizationService } from '@app/services/api_services/organization.service';
import { UserStateService } from '@app/services/global_states/user-state.service';
import { Modal } from 'flowbite';

@Component({
  selector: 'app-create-category-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-category-modal.component.html',
  styleUrl: './create-category-modal.component.scss',
})
export class CreateCategoryModalComponent implements OnChanges {
  @Input() isModalOpen!: boolean;
  @ViewChild('addCategoryModal') addCategoryModal!: ElementRef;
  public categoryModal!: Modal;
  public imgUrl = config.IMG_URL;
  public isSubmitted = false;
  public isCreatingCategory = signal(false);
  public searchedOrganizations = signal<OrganizationsGetResponse | null>(null);
  public organizations = signal<Organization[]>([]);

  public categoryForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    gender: new FormControl('', [Validators.required]),
    organization: new FormControl('', [Validators.required]),
  });

  private _categoryService = inject(CategoryService);
  private _organizationService = inject(OrganizationService);
  private _genericService = inject(GenericApiService);
  private _userState = inject(UserStateService);

  constructor() {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (this.isModalOpen === true) {
      console.log('ngOnChanges', changes);
      this.getOrganizations();
    }
  }

  ngAfterViewInit(): void {
    this.categoryModal = new Modal(this.addCategoryModal.nativeElement);
  }

  getOrganizations() {
    this._organizationService
      .getOrganizations({ user_id: this._userState.me()!.id_user })
      .subscribe({
        next: (res) => {
          console.log(res);
          this.organizations.set(res.data.items);
        },
        error: (err) => {
          console.log(err);
        },
      });
  }

  onSubmit(e: Event) {
    e.preventDefault();
    this.isSubmitted = true;
    if (this.categoryForm.invalid) return;
    this.isCreatingCategory.set(true);
    const category: Category = {
      name: this.categoryForm.value.name as string,
      gender: this.categoryForm.value.gender as Gender,
      organization_id: Number(this.categoryForm.value.organization),
      user_id: this._userState.me()!.id_user,
    };

    this._categoryService.createCategory(category).subscribe({
      next: (res) => {
        console.log(res);
        this.isCreatingCategory.set(false);
        this.categoryForm.reset();
      },
      error: (err) => {
        console.log(err);
        this.isCreatingCategory.set(false);
      },
    });

    this.categoryForm.markAsPristine();
    this.isSubmitted = false;
    this.categoryModal.hide();
  }

  public getCategoryModal() {
    console.log('getCategoryModal', this.categoryModal);
    return this.categoryModal;
  }
}
