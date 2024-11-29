import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EMPTY } from 'src/app/core/constants';
import { UserListComponent } from './list/user-list.component';
import { ManageUserComponent } from './manage/manage-user.component';
import { Module } from 'src/app/core/models/module.model';

const routes: Routes = [
  {
    path: EMPTY,
    component: UserListComponent,
    data: { title: Module.USER.uiName }
  },
  {
    path: 'manage/:id',
    component: ManageUserComponent,
    data: { title: 'Manage User' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsersRoutingModule { }
