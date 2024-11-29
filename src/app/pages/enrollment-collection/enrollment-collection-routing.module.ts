import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EMPTY } from 'src/app/core/constants';
import { EnrollmentCollectionListComponent } from './list/enrollment-collection-list.component';
import { EnrollmentCollectionMangeComponent } from './manage/enrollment-collection-manage.component';
import { EnrollmentCollectionCreateComponent } from './create/enrollment-collection-create.component';
import { Module } from 'src/app/core/models/module.model';

const routes: Routes = [
  {
    path: EMPTY,
    component: EnrollmentCollectionListComponent,
    data: { title: Module.ENROLLMENT_COLLECTION.uiName }
  },
  {
    path: 'create',
    component: EnrollmentCollectionCreateComponent,
    data: { title: `Create ${Module.ENROLLMENT_COLLECTION.name}` }
  },
  {
    path: 'manage/:id/:tenantId',
    component: EnrollmentCollectionMangeComponent,
    data: { title: `Manage ${Module.ENROLLMENT_COLLECTION.name}` }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EnrollmentCollectionRoutingModule { }
