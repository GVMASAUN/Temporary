import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddMerchantBinCaidComponent } from './add-merchant-bin-caid/add-merchant-bin-caid.component';
import { AddMerchantVmidVsidComponent } from './add-merchant-vmid-vsid/add-merchant-vmid-vsid.component';
import { CreateMerchantsComponent } from './create-merchants/create-merchants.component';
import { EMPTY } from 'src/app/core/constants';

const routes: Routes = [
  {
    path: EMPTY,
    redirectTo: 'merchants',
    pathMatch: 'full'
  },
  {
    path: 'merchants',
    component: CreateMerchantsComponent
  },
  {
    path: 'merchants/add-bin-caid',
    component: AddMerchantBinCaidComponent,
    data: {title: 'Add Merchant'}
  },
  {
    path: 'merchants/add-vmid-vsid',
    component: AddMerchantVmidVsidComponent,
    data: {title: 'Add Merchant'}
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MerchantGroupCreateRoutingModule { }
