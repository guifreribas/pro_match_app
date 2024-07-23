import { inject, Injectable } from '@angular/core';
import { config } from '../config/config';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ResourceService {
  private apiUrl = `${config.apiUrl}/resources`;
  private http = inject(HttpClient);

  constructor() {}

  getResources(): any {
    return this.http.get(this.apiUrl);
  }

  getResource(id: string): any {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  createResource(resource: any): any {
    return this.http.post(this.apiUrl, resource);
  }

  updateResource(resource: any, id: string): any {
    return this.http.put(`${this.apiUrl}/${id}`, resource);
  }

  deleteResource(id: number): any {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
