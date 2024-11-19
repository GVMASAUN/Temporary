import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EMPTY } from 'src/app/core/constants';
import { ProgramsListComponent } from './list/programs-list.component';
import { ProgramManageComponent } from './manage/program-manage.component';

const routes: Routes = [
  {
    path: EMPTY,
    component: ProgramsListComponent,
  },
  {
    path: 'manage/:id',
    component: ProgramManageComponent,
    data: { title: 'Manage Program' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProgramsRoutingModule { }
