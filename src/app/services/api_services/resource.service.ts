import { inject, Injectable } from '@angular/core';
import { config } from '../../config/config';
import { HttpClient } from '@angular/common/http';
import { Resource, ResourceData } from '../../models/resource';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ResourceService {
  private apiUrl = `${config.apiUrl}/resources`;
  private http = inject(HttpClient);

  constructor() {}

  getResources(): Observable<Resource[]> {
    return this.http.get<Resource[]>(this.apiUrl);
  }

  getResource(id: string): Observable<Resource> {
    return this.http.get<Resource>(`${this.apiUrl}/${id}`);
  }

  createResource(resource: ResourceData): Observable<Resource> {
    return this.http.post<Resource>(this.apiUrl, resource);
  }

  updateResource(resource: Resource, id: string): Observable<Resource> {
    return this.http.put<Resource>(`${this.apiUrl}/${id}`, resource);
  }

  deleteResource(id: number): any {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
