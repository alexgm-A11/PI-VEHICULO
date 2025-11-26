import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { VehiculoComponent } from './components/vehiculo/vehiculo';

export const routes: Routes = [
     {path:'',component:Home},
    {path:'vehiculos', component:VehiculoComponent},
    {path:'**',redirectTo:''}
];
