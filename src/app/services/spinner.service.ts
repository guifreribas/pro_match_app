import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SpinnerService {
  static readonly isLoading = signal(false);

  constructor() {}

  setLoading(isLoading: boolean) {
    SpinnerService.isLoading.set(isLoading);
  }
}
