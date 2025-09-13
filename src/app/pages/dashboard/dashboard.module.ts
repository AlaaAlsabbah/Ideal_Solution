import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard';
import { FormsModule } from '@angular/forms';

const routes: Routes = [
  { path: '', component: DashboardComponent }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        RouterModule.forChild(routes),
        DashboardComponent
      ]

})
export class DashboardModule {}