import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GenericApiService {
  private http = inject(HttpClient);

  getAll<T>(url: string): Observable<T> {
    return this.http.get<T>(url);
  }

  getOne<T>(url: string, id: number): Observable<T> {
    return this.http.get<T>(`${url}/${id}`);
  }

  create<T, R>(url: string, data: T): Observable<R> {
    return this.http.post<R>(url, data);
  }

  update<T, R>(url: string, id: number, data: Partial<T>): Observable<R> {
    return this.http.put<R>(`${url}/${id}`, data);
  }

  delete<T>(url: string, id: number): Observable<T> {
    return this.http.delete<T>(`${url}/${id}`);
  }
}
