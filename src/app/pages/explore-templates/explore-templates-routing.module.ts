import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExploreTemplatesListComponent } from './list/explore-templates-list.component';
import { CreateEpmTemplateComponent } from './create/create-epm-template.component';
import { ManageEpmTemplateComponent } from './manage/manage-epm-template.component';
import { EMPTY } from 'src/app/core/constants';

const routes: Routes = [
  {
    path: EMPTY,
    component: ExploreTemplatesListComponent
  },
  {
    path: 'create',
    component: CreateEpmTemplateComponent,
    data: {title: 'Create Epm Template'}
  },
  {
    path: 'manage/:id',
    component: ManageEpmTemplateComponent,
    data: {title: 'Manage Epm Template'}
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExploreTemplatesRoutingModule { }
