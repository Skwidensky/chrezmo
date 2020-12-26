import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { Chrezmo } from './client/chrezmo/chrezmo.component'
import { ChartsComponent } from './charts/charts.component'

const routes: Routes = [
  { path: 'chrezmo', component: Chrezmo },
  { path: 'charts', component: ChartsComponent },
]; // sets up routes constant where you define your routes

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
