import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { MerchantGroupsListComponent } from './merchant-groups-list.component';

@NgModule({
  declarations: [MerchantGroupsListComponent],
  imports: [
    SharedModule,
  ]
})
export class MerchantGroupsListModule { }
