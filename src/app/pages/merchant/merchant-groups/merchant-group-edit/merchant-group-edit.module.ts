import { NgModule } from '@angular/core';

import { SharedModule } from 'src/app/shared/shared.module';
import { EditBasicsComponent } from './edit-basics/edit-basics.component';
import { EditMerchantsComponent } from './edit-merchants/edit-merchants.component';
import { MerchantGroupEditRoutingModule } from './merchant-group-edit-routing.module';
import { MerchantGroupEditComponent } from './merchant-group-edit.component';

@NgModule({
  declarations: [
    MerchantGroupEditComponent,
    EditMerchantsComponent,
    EditBasicsComponent
  ],
  imports: [
    MerchantGroupEditRoutingModule,
    SharedModule,
  ]
})
export class MerchantGroupEditModule { }
