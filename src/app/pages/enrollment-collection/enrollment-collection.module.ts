import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { EnrollmentCollectionRoutingModule } from './enrollment-collection-routing.module';
import { EnrollmentCollectionListComponent } from './list/enrollment-collection-list.component';
import { EnrollmentCollectionDetailComponent } from './shared/enrollment-collection-detail/enrollment-collection-detail.component';
import { EnrollmentCollectionMangeComponent } from './manage/enrollment-collection-manage.component';
import { EnrollmentCollectionCreateComponent } from './create/enrollment-collection-create.component';

@NgModule({
  declarations: [
    EnrollmentCollectionListComponent,
    EnrollmentCollectionDetailComponent,
    EnrollmentCollectionCreateComponent,
    EnrollmentCollectionMangeComponent
  ],
  imports: [
    EnrollmentCollectionRoutingModule,
    SharedModule
  ],
  exports: [
    EnrollmentCollectionCreateComponent
  ]
})
export class EnrollmentCollectionModule { }
