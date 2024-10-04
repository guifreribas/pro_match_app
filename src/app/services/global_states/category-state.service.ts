import { Injectable, signal } from '@angular/core';
import { Category } from '@app/models/match';

@Injectable({
  providedIn: 'root',
})
export class CategoryStateService {
  readonly categories = signal<Category[]>([]);

  constructor() {}

  getCategories(): Category[] {
    return this.categories();
  }

  setCategories(categories: Category[]) {
    this.categories.set(categories);
  }

  updateCategories(categories: Category[]) {
    this.categories.update((prev) => {
      if (!prev) return prev;
      return [...prev, ...categories];
    });
  }

  clearCategories() {
    this.categories.set([]);
  }
}
