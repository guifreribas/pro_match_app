import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private isLoggedIn = false;
  private url = environment.api_url;

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.url}/auth/login`, { email, password });
  }

  register(email: string, password: string): Observable<any> {
    return this.http.post(`${this.url}/auth/register`, { email, password });
  }

  logout() {
    return this.http.delete(`${this.url}/auth/logout`);
  }

  setLoggedIn(isLoggedIn: boolean) {
    this.isLoggedIn = isLoggedIn;
  }

  isAuthenticated(): boolean {
    return this.isLoggedIn;
  }
}
