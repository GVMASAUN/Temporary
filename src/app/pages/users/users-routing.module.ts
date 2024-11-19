import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EMPTY } from 'src/app/core/constants';
import { UserListComponent } from './list/user-list.component';
import { ManageUserComponent } from './manage/manage-user.component';

const routes: Routes = [
  {
    path: EMPTY,
    component: UserListComponent
  },
  {
    path: 'manage/:id',
    component: ManageUserComponent,
    data: {title: 'Manage User'}
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsersRoutingModule { }
