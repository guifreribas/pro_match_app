import { inject, Injectable } from '@angular/core';
import { config } from '../../config/config';
import { Observable } from 'rxjs';
import {
  deleteResponse,
  getAllResponse,
  getOneResponse,
  postResponse,
  updateResponse,
} from '../../models/api';
import { User } from '../../models/user';
import { GenericApiService } from './generic-api.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = `${config.apiUrl}/users`;
  private genericService = inject(GenericApiService);
  private http = inject(HttpClient);

  constructor() {}

  getMe(): Observable<any> {
    return this.http.get<any>(this.apiUrl + '/me');
  }

  getUsers(): Observable<getAllResponse<User>> {
    return this.genericService.getAll<getAllResponse<User>>(this.apiUrl);
  }

  getUser(id: number): Observable<getOneResponse<User>> {
    return this.genericService.getOne<getOneResponse<User>>(this.apiUrl, id);
  }

  createUser(user: User): Observable<postResponse<User>> {
    return this.genericService.create<User, postResponse<User>>(
      this.apiUrl,
      user
    );
  }

  updateUser(user: any, id: number): Observable<updateResponse<User>> {
    return this.genericService.update<User, updateResponse<User>>(
      this.apiUrl,
      id,
      user
    );
  }

  deleteUser(id: number): Observable<deleteResponse> {
    return this.genericService.delete<deleteResponse>(this.apiUrl, id);
  }
}
