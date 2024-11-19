import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddMerchantBinCaidComponent } from '../merchant-group-create/add-merchant-bin-caid/add-merchant-bin-caid.component';
import { AddMerchantVmidVsidComponent } from '../merchant-group-create/add-merchant-vmid-vsid/add-merchant-vmid-vsid.component';
import { EditBasicsComponent } from './edit-basics/edit-basics.component';
import { EditMerchantsComponent } from './edit-merchants/edit-merchants.component';
import { EMPTY } from 'src/app/core/constants';

const routes: Routes = [
  { 
    path: EMPTY, 
    redirectTo: 'basics', 
    pathMatch: 'full' 
  },
  { 
    path: 'basics', 
    component: EditBasicsComponent 
  },
  { 
    path: 'merchants', 
    component: EditMerchantsComponent 
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
export class MerchantGroupEditRoutingModule {}
