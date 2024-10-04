import { CommonModule } from '@angular/common';
import {
  Component,
  effect,
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
  firstValueFrom,
  Subject,
  switchMap,
} from 'rxjs';

type Action = 'NEXT' | 'PREVIOUS' | 'GO_ON_PAGE';

interface GetCategoriesParams {
  q?: string;
  page?: string;
  userId?: number;
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
  public isSubmitted = false;
  public page = 1;

  private _categoryService = inject(CategoryService);
  private _userState = inject(UserStateService);
  private _searchSubject = new Subject<string>();
  private _hasFetchedCategories = false;

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

    effect(() => {
      const user = this._userState.me();
      if (user?.id_user && this._hasFetchedCategories === false) {
        const firstPage = '1';
        this._getCategories({ userId: user.id_user, page: firstPage });
        this._hasFetchedCategories = true;
      }
    });
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.reInitFlowbite();
  }

  reInitFlowbite() {
    setTimeout(() => {
      initFlowbite();
    }, 100);
  }

  private async _getCategories(params: Partial<GetCategoriesParams>) {
    const response = await firstValueFrom(
      this._categoryService.getCategories(params)
    );
    this.categoriesResponse.set(response);
    this.categories.set(response.data.items);
    this.reInitFlowbite();
  }

  onCreateCategoryShowModal() {
    const modal = this.createCategoryModalComponent.getCategoryModal();
    modal.show();
    this.isModalOpen = true;
  }

  goOnPage(page: number) {
    this._getCategories({
      userId: this._userState.me()?.id_user,
      page: page.toString(),
    });
  }

  goPreviousPage() {
    const currentPage = this.categoriesResponse()?.data?.currentPage ?? 0;
    const previusPage = currentPage - 1 > 0 ? currentPage - 1 : 1;
    this.goOnPage(previusPage);
  }

  goNextPage() {
    const currentPage = this.categoriesResponse()?.data?.currentPage ?? 0;
    if (currentPage === this.categoriesResponse()?.data?.totalPages) return;
    this.goOnPage(currentPage + 1);
  }
}
