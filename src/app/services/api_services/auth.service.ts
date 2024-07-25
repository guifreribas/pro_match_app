import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private isLoggedIn = false;
  private url = environment.api_url;

  login(
    email: string,
    password: string,
    remember: boolean = false
  ): Observable<any> {
    return this.http.post(`${this.url}/auth/login`, {
      email,
      password,
      remember,
    });
  }

  register(
    email: string,
    password: string,
    role: string = 'ADMIN'
  ): Observable<any> {
    return this.http.post(`${this.url}/auth/register`, {
      email,
      password,
      role,
    });
  }

  logout() {
    return this.http.post(`${this.url}/auth/logout`, {});
  }

  setLoggedIn(isLoggedIn: boolean) {
    this.isLoggedIn = isLoggedIn;
  }

  isAuthenticated(): boolean {
    return this.isLoggedIn;
  }

  isLogged(): Observable<boolean> {
    return this.http.get<boolean>(`${this.url}/auth/check-auth`);
  }
}
