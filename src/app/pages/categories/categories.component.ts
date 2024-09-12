import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  inject,
  signal,
  ViewChild,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { CreateCategoryModalComponent } from '@app/components/category/create-category-modal/create-category-modal.component';
import { DashboardPanelLayoutComponent } from '@app/layouts/dashboard-panel-layout/dashboard-panel-layout.component';
import { CategoriesGetResponse, Category } from '@app/models/category';
import { CategoryService } from '@app/services/api_services/category.service';
import { UserStateService } from '@app/services/global_states/user-state.service';
import { initFlowbite, Modal } from 'flowbite';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  Subject,
  switchMap,
} from 'rxjs';

type Action = 'NEXT' | 'PREVIOUS' | 'GO_ON_PAGE';

interface GetCategoriesParams {
  q?: string;
  page?: string;
  userId?: number;
  action: Action;
}

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [
    DashboardPanelLayoutComponent,
    RouterModule,
    CommonModule,
    CreateCategoryModalComponent,
  ],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss',
})
export class CategoriesComponent {
  @ViewChild(CreateCategoryModalComponent)
  createCategoryModalComponent!: CreateCategoryModalComponent;
  public categoriesResponse = signal<CategoriesGetResponse | null>(null);
  public categories = signal<any[]>([]);
  public searchedCategories = signal<Category[] | null>(null);
  public isModalOpen = false;

  private _categoryService = inject(CategoryService);
  private _userState = inject(UserStateService);
  private _searchSubject = new Subject<string>();

  public muckCategories = [
    {
      id_category: 1,
      nombre: 'Primera División',
      gender: 'Masculino',
      organization: 'Sagrat Cor',
    },
    {
      id_category: 2,
      nombre: 'Segunda División',
      gender: 'Masculino',
      organization: 'Sagrat Cor',
    },
  ];

  constructor() {
    this._searchSubject
      .pipe(
        debounceTime(200),
        distinctUntilChanged(),
        switchMap((query) =>
          this._categoryService.getCategories({ q: query }).pipe(
            catchError((error) => {
              console.log(error);
              return [];
            })
          )
        )
      )
      .subscribe((res) => {
        console.log(res);
        this.searchedCategories.set(res.data.items);
      });
  }

  ngOnInit(): void {
    const firstPage = 1;
    this._getCategories({
      userId: this._userState.me()!.id_user,
      action: 'GO_ON_PAGE',
      page: firstPage.toString(),
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      initFlowbite();
    }, 100);
  }

  private _getCategories(params: GetCategoriesParams) {
    this._categoryService.getCategories(params).subscribe({
      next: (res) => {
        console.log(res);
        console.log({ categories: res.data.items });
        this.categoriesResponse.set(res);
        this.categories.set(res.data.items);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  onCreateCategoryShowModal() {
    const modal = this.createCategoryModalComponent.getCategoryModal();
    modal.show();
    this.isModalOpen = true;
  }
}
