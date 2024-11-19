import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MerchantGroupViewRoutingModule } from './merchant-group-view-routing.module';
import { MerchantGroupViewMenuComponent } from './merchant-group-view-menu/merchant-group-view-menu.component';
import { VdsLibModule } from '@visa/vds-angular';

import { MerchantGroupHistoryComponent } from './merchant-group-history/merchant-group-history.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [MerchantGroupViewMenuComponent, MerchantGroupHistoryComponent],
  imports: [
    CommonModule,
    MerchantGroupViewRoutingModule,
    VdsLibModule,
    SharedModule
  ]
})
export class MerchantGroupViewModule {}
