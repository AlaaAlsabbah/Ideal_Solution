import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms'; 
import { AddUser } from './add-user';

const routes: Routes = [
  { path: '', component: AddUser }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
    AddUser
  ]
})
export class AddUserModule {}