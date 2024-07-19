import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);

  login(email: string, password: string): Observable<any> {
    return this.http.post('/api/auth/login', { email, password });
  }

  register(email: string, password: string): Observable<any> {
    return this.http.post('/api/auth/register', { email, password });
  }

  // logout() {
  //   return this.http.post('/api/auth/logout');
  // }
}
