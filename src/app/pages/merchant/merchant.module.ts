import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MerchantRoutingModule } from './merchant-routing.module';
import { VdsLibModule } from '@visa/vds-angular';
import { TableDataCountService } from 'src/app/services/private/table-data-count.service';
import { CreateDataService } from 'src/app/services/private/create-data.service';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [],
  imports: [
    SharedModule,
    MerchantRoutingModule
  ],
  providers: [TableDataCountService, CreateDataService]
})
export class MerchantModule { }
