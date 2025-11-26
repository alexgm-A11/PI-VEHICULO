import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Vehiculo } from '../models/vehiculo';

@Injectable({
  providedIn: 'root',
})
export class VehiculoService {
  private url = "http://localhost:9090/api/v1/vehiculos";

  constructor(private http:HttpClient) {}

  getAll():Observable<Vehiculo[]> {
    return this.http.get<Vehiculo[]>(this.url);
  }

  getById(id: number): Observable<Vehiculo> {
    return this.http.get<Vehiculo>(`${this.url}/${id}`);
  }
   
  create(vehiculo: Vehiculo): Observable<Vehiculo> {
    return this.http.post<Vehiculo>(this.url, vehiculo);
  }
  
  update(id: number, vehiculo: Vehiculo): Observable<Vehiculo> {
    return this.http.put<Vehiculo>(`${this.url}/${id}`, vehiculo);
  }
}
