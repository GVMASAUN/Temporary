import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EMPTY } from 'src/app/core/constants';
import { Module } from 'src/app/core/models/module.model';
import { PayWithPointCreateComponent } from './create/pay-with-point-create/pay-with-point-create.component';
import { PayWithPointListComponent } from './list/pay-with-point-list/pay-with-point-list.component';
import { PayWithPointManageComponent } from './manage/pay-with-point-manage/pay-with-point-manage.component';
import { PwpPanEligibilityComponent } from './pwp-pan-eligibility/pwp-pan-eligibility.component';
import { PwpTransactionSearchComponent } from './pwp-transaction-search/pwp-transaction-search.component';

const routes: Routes = [
  {
    path: EMPTY,
    component: PayWithPointListComponent,
    data: {
      title: `PWP-Plans`
    }
  },
  {
    path: 'pwp-pan-eligibility',
    component: PwpPanEligibilityComponent,
    data: {
      title: `PWP-Pan Eligibility`
    }
  },
  {
    path: 'pwp-transaction-search/:pan/:tenId/:subTenId',
    component: PwpTransactionSearchComponent,
    data: {
      title: `PWP-Transaction Search`
    }
  },
  {
    path: 'pwp-transaction-search',
    component: PwpTransactionSearchComponent,
    data: {
      title: `PWP-Transaction Search`
    }
  },
  {
    path: 'create',
    component: PayWithPointCreateComponent,
    data: {
      title: `Create ${Module.PAY_WITH_POINT.name} Plan`
    }
  },
  {
    path: 'manage/:planId/:tenantEnrollmentId/:version',
    component: PayWithPointManageComponent,
    data: {
      title: `Manage ${Module.PAY_WITH_POINT.name} Plan`
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PayWithPointRoutingModule { }
