import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddMerchantBinCaidComponent } from '../merchant-group-create/add-merchant-bin-caid/add-merchant-bin-caid.component';
import { AddMerchantVmidVsidComponent } from '../merchant-group-create/add-merchant-vmid-vsid/add-merchant-vmid-vsid.component';
import { BasicsMenuComponent } from './basics-menu/basics-menu.component';
import { ClientsMenuComponent } from './clients-menu/clients-menu.component';
import { LinkedPlansMenuComponent } from './linked-plans-menu/linked-plans-menu.component';
import { MerchantsMenuComponent } from './merchants-menu/merchants-menu.component';
import { EMPTY } from 'src/app/core/constants';
import { MerchantGroupHistoryComponent } from './merchant-group-history/merchant-group-history.component';

const routes: Routes = [
  {
    path: EMPTY,
    redirectTo: 'basics',
    pathMatch: 'full'
  },
  {
    path: 'basics',
    component: BasicsMenuComponent,
    children: [
      {
        path: EMPTY,
        loadChildren: () =>
          import(
            'src/app/pages/merchant/merchant-groups/merchant-group-view/basics-menu/basics-menu.module'
          ).then(module => module.BasicsMenuModule)
      }
    ]
  },
  {
    path: 'clients',
    component: ClientsMenuComponent,
    children: [
      {
        path: EMPTY,
        loadChildren: () =>
          import(
            'src/app/pages/merchant/merchant-groups/merchant-group-view/clients-menu/clients-menu.module'
          ).then(module => module.ClientsMenuModule)
      }
    ]
  },
  {
    path: 'merchants',
    component: MerchantsMenuComponent,
    children: [
      {
        path: EMPTY,
        loadChildren: () =>
          import(
            'src/app/pages/merchant/merchant-groups/merchant-group-view/merchants-menu/merchants-menu.module'
          ).then(module => module.MerchantsMenuModule)
      }
    ]
  },
  {
    path: 'linked-plans',
    component: LinkedPlansMenuComponent,
    children: [
      {
        path: EMPTY,
        loadChildren: () =>
          import(
            'src/app/pages/merchant/merchant-groups/merchant-group-view/linked-plans-menu/linked-plans-menu.module'
          ).then(module => module.LinkedPlansMenuModule)
      }
    ]
  },
  {
    path: 'history',
    component: MerchantGroupHistoryComponent,
    data: {title: 'Merchant Group History'}
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
export class MerchantGroupViewRoutingModule {}
