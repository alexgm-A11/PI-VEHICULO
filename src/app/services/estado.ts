import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Estado } from '../models/estado';

@Injectable({ providedIn: 'root' })
export class EstadoService {
  private API_URL = 'http://localhost:9090/api/v1/estados'; 

  constructor(private http: HttpClient) {}

  getAll(): Observable<Estado[]> {
    return this.http.get<Estado[]>(this.API_URL);
  }
   create(estado: Estado): Observable<Estado> {
    return this.http.post<Estado>(this.API_URL, estado);
  }

   //Actualizar categoría
    update(id: number, estado: Estado): Observable<Estado> {
      return this.http.put<Estado>(`${this.API_URL}/${id}`, estado);
    }

}