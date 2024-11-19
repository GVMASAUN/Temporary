import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { AddMerchantBinCaidComponent } from './add-merchant-bin-caid/add-merchant-bin-caid.component';
import { TabBinCaidBulkUploadComponent } from './add-merchant-bin-caid/tab-bin-caid-bulk-upload/tab-bin-caid-bulk-upload.component';
import { TabBinCaidComponent } from './add-merchant-bin-caid/tab-bin-caid/tab-bin-caid.component';
import { AddMerchantVmidVsidComponent } from './add-merchant-vmid-vsid/add-merchant-vmid-vsid.component';
import { TabVmidVsidBulkUploadComponent } from './add-merchant-vmid-vsid/tab-vmid-vsid-bulk-upload/tab-vmid-vsid-bulk-upload.component';
import { SearchTransactionDetailsComponent } from './add-merchant-vmid-vsid/tab-vmid-vsid-find-merchants/search-transaction-details/search-transaction-details.component';
import { TdDataTableComponent } from './add-merchant-vmid-vsid/tab-vmid-vsid-find-merchants/search-transaction-details/td-data-table/td-data-table.component';
import { SearchTransactionIdComponent } from './add-merchant-vmid-vsid/tab-vmid-vsid-find-merchants/search-transaction-id/search-transaction-id.component';
import { TidDataTableComponent } from './add-merchant-vmid-vsid/tab-vmid-vsid-find-merchants/search-transaction-id/tid-data-table/tid-data-table.component';
import { SearchVmidComponent } from './add-merchant-vmid-vsid/tab-vmid-vsid-find-merchants/search-vmid/search-vmid.component';
import { VmidDataTableComponent } from './add-merchant-vmid-vsid/tab-vmid-vsid-find-merchants/search-vmid/vmid-data-table/vmid-data-table.component';
import { RequirementsComponent } from './add-merchant-vmid-vsid/tab-vmid-vsid-find-merchants/search-vsid/requirements/requirements.component';
import { SearchVsidComponent } from './add-merchant-vmid-vsid/tab-vmid-vsid-find-merchants/search-vsid/search-vsid.component';
import { VsidDataTableComponent } from './add-merchant-vmid-vsid/tab-vmid-vsid-find-merchants/search-vsid/vsid-data-table/vsid-data-table.component';
import { TabVmidVsidFindMerchantsComponent } from './add-merchant-vmid-vsid/tab-vmid-vsid-find-merchants/tab-vmid-vsid-find-merchants.component';
import { TabVmidVsidComponent } from './add-merchant-vmid-vsid/tab-vmid-vsid/tab-vmid-vsid.component';
import { CreateBasicsComponent } from './create-basics/create-basics.component';
import { CreateDialogComponent } from './create-dialog/create-dialog.component';
import { CreateMerchantsComponent } from './create-merchants/create-merchants.component';
import { MerchantGroupCreateRoutingModule } from './merchant-group-create-routing.module';

import { ActivateConfirmDialogComponent } from './activate-confirm-dialog/activate-confirm-dialog.component';
import { AddMerchantConfirmDialogComponent } from './add-merchant-confirm-dialog/add-merchant-confirm-dialog.component';
import { DeactivateConfirmDialogComponent } from './deactivate-confirm-dialog/deactivate-confirm-dialog.component';

@NgModule({
  declarations: [
    CreateMerchantsComponent,
    CreateBasicsComponent,
    AddMerchantBinCaidComponent,
    TabBinCaidComponent,
    TabBinCaidBulkUploadComponent,
    AddMerchantVmidVsidComponent,
    TabVmidVsidComponent,
    TabVmidVsidBulkUploadComponent,
    TabVmidVsidFindMerchantsComponent,
    SearchVmidComponent,
    SearchVsidComponent,
    SearchTransactionIdComponent,
    SearchTransactionDetailsComponent,
    RequirementsComponent,
    VsidDataTableComponent,
    VmidDataTableComponent,
    TidDataTableComponent,
    TdDataTableComponent,
    CreateDialogComponent,
    DeactivateConfirmDialogComponent,
    ActivateConfirmDialogComponent,
    AddMerchantConfirmDialogComponent
  ],
  imports: [
    MerchantGroupCreateRoutingModule,
    SharedModule
  ]
})
export class MerchantGroupCreateModule { }
