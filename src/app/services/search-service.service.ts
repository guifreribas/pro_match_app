import { Injectable } from '@angular/core';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  Observable,
  of,
  switchMap,
} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SearchServiceService {
  search<T>(
    source$: Observable<string>,
    serachFn: (query: string) => Observable<T>,
    minLength: number = 2,
    debounceMs: number = 200
  ): Observable<T | null> {
    return source$.pipe(
      debounceTime(debounceMs),
      distinctUntilChanged(),
      switchMap((query: string) => {
        if (query.length >= minLength) {
          return serachFn(query).pipe(
            catchError((error) => {
              console.error(error);
              return of(null);
            })
          );
        } else {
          return of(null);
        }
      })
    );
  }
}
