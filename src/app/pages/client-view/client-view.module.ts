import { NgModule } from '@angular/core';

import { SharedModule } from 'src/app/shared/shared.module';
import { AssignProgramModalComponent } from '../uncategorized-offers/assign-program-modal/assign-program-modal.component';
import { ConfirmAssignModalComponent } from '../uncategorized-offers/confirm-assign-modal/confirm-assign-modal.component';
import { CardholderComponent } from './cardholder/cardholder.component';
import { ClientViewRoutingModule } from './client-view-routing.module';
import { ExploreTemplateComponent } from './explore-template/explore-template.component';
import { MerchantComponent } from './merchant/merchant.component';
import { ProgramElementComponent } from './program-element/program-element.component';

@NgModule({
  declarations: [
    MerchantComponent,
    CardholderComponent,
    ProgramElementComponent,
    ExploreTemplateComponent,
    AssignProgramModalComponent,
    ConfirmAssignModalComponent
  ],
  imports: [
    ClientViewRoutingModule,
    SharedModule,
  ]
})
export class ClientViewModule {}
