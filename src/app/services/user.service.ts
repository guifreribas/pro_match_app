import { inject, Injectable } from '@angular/core';
import { config } from '../config/config';
import { Observable } from 'rxjs';
import {
  deleteOneResponse,
  getAllResponse,
  getOneResponse,
  postOneResponse,
  putOneResponse,
} from '../models/api';
import { User } from '../models/user';
import { GenericApiService } from './generic-api.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = `${config.apiUrl}/users`;
  private genericService = inject(GenericApiService);

  constructor() {}

  getUsers(): Observable<getAllResponse<User>> {
    return this.genericService.getAll<getAllResponse<User>>(this.apiUrl);
  }

  getUser(id: number): Observable<getOneResponse<User>> {
    return this.genericService.getOne<getOneResponse<User>>(this.apiUrl, id);
  }

  createUser(user: User): Observable<postOneResponse<User>> {
    return this.genericService.create<User, postOneResponse<User>>(
      this.apiUrl,
      user
    );
  }

  updateUser(user: any, id: number): Observable<putOneResponse<User>> {
    return this.genericService.update<User, putOneResponse<User>>(
      this.apiUrl,
      id,
      user
    );
  }

  deleteUser(id: number): Observable<deleteOneResponse> {
    return this.genericService.delete<deleteOneResponse>(this.apiUrl, id);
  }
}
