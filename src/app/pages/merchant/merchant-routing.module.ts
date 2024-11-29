import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MerchantGroupEditComponent } from './merchant-groups/merchant-group-edit/merchant-group-edit.component';
import { MerchantGroupViewMenuComponent } from './merchant-groups/merchant-group-view/merchant-group-view-menu/merchant-group-view-menu.component';
import { MerchantGroupsListComponent } from './merchant-groups/merchant-groups-list/merchant-groups-list.component';
import { EMPTY } from 'src/app/core/constants';
import { Module } from 'src/app/core/models/module.model';

const routes: Routes = [
  {
    path: EMPTY,
    component: MerchantGroupsListComponent,
    children: [
      {
        path: EMPTY,
        loadChildren: () =>
          import(
            'src/app/pages/merchant/merchant-groups/merchant-groups-list/merchant-groups-list.module'
          ).then(module => module.MerchantGroupsListModule)
      }
    ],
    data: { title: Module.MERCHANT.uiName }
  },
  {
    path: 'view/:id',
    component: MerchantGroupViewMenuComponent,
    children: [
      {
        path: EMPTY,
        loadChildren: () =>
          import(
            'src/app/pages/merchant/merchant-groups/merchant-group-view/merchant-group-view.module'
          ).then(module => module.MerchantGroupViewModule),
        data: { title: 'Manage Merchant Group' }
      }
    ]
  },
  {
    path: 'edit/:id',
    component: MerchantGroupEditComponent,
    children: [
      {
        path: EMPTY,
        loadChildren: () =>
          import(
            'src/app/pages/merchant/merchant-groups/merchant-group-edit/merchant-group-edit.module'
          ).then(module => module.MerchantGroupEditModule),
        data: { title: 'Edit Merchant Group' }
      }
    ]
  },
  {
    path: 'create/:id',
    children: [
      {
        path: EMPTY,
        loadChildren: () =>
          import(
            'src/app/pages/merchant/merchant-groups/merchant-group-create/merchant-group-create.module'
          ).then(module => module.MerchantGroupCreateModule),
        data: { title: 'Create Merchant Group' }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MerchantRoutingModule {}
