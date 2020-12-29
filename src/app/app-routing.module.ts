import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { Chrezmo } from './client/chrezmo/chrezmo.component'
import { TrendsComponent } from './client/trends/trends.component'

const routes: Routes = [
  { path: '', component: Chrezmo },
  { path: 'trends', component: TrendsComponent },
]; // sets up routes constant where you define your routes

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
