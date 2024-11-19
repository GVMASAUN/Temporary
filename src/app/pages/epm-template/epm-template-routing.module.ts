import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EpmTemplateListComponent } from './list/epm-template-list.component';
import { CreateEpmTemplateComponent } from './create/create-epm-template.component';
import { ManageEpmTemplateComponent } from './manage/manage-epm-template.component';
import { EMPTY } from 'src/app/core/constants';

const routes: Routes = [
  {
    path: EMPTY,
    component: EpmTemplateListComponent
  },
  {
    path: 'create',
    component: CreateEpmTemplateComponent,
    data: {title: 'Create EPM Template'}
  },
  {
    path: 'manage/:id',
    component: ManageEpmTemplateComponent,
    data: {title: 'Manage EPM Template'}
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EpmTemplateRoutingModule { }
