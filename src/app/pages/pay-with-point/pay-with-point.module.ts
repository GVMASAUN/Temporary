import { NgModule } from '@angular/core';

import { SharedModule } from 'src/app/shared/shared.module';
import { EnrollmentCollectionModule } from '../enrollment-collection/enrollment-collection.module';
import { PayWithPointCreateComponent } from './create/pay-with-point-create/pay-with-point-create.component';
import { PayWithPointListComponent } from './list/pay-with-point-list/pay-with-point-list.component';
import { PayWithPointManageComponent } from './manage/pay-with-point-manage/pay-with-point-manage.component';
import { PayWithPointRoutingModule } from './pay-with-point-routing.module';
import { PwpPanEligibilityComponent } from './pwp-pan-eligibility/pwp-pan-eligibility.component';
import { PwpTransactionDetailsDialogComponent } from './pwp-transaction-search/pwp-transaction-details-dialog/pwp-transaction-details-dialog.component';
import { PwpTransactionSearchComponent } from './pwp-transaction-search/pwp-transaction-search.component';
import { AddMerchantCodeDialogComponent } from './shared/details/pay-with-point-details/add-merchant-code-dialog/add-merchant-code-dialog.component';
import { CreateEnrollmentCollectionDialogComponent } from './shared/details/pay-with-point-details/create-enrollment-collection-dialog/create-enrollment-collection-dialog.component';
import { PayWithPointDetailsComponent } from './shared/details/pay-with-point-details/pay-with-point-details.component';


@NgModule({
  declarations: [
    PayWithPointListComponent,
    PayWithPointCreateComponent,
    PayWithPointManageComponent,
    PayWithPointDetailsComponent,
    AddMerchantCodeDialogComponent,
    CreateEnrollmentCollectionDialogComponent,
    PwpPanEligibilityComponent,
    PwpTransactionSearchComponent,
    PwpTransactionDetailsDialogComponent
  ],
  imports: [
    SharedModule,
    PayWithPointRoutingModule,
    EnrollmentCollectionModule,
  ]
})
export class PayWithPointModule { }
