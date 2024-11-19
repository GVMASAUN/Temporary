import { NgModule } from '@angular/core';

import { SharedModule } from 'src/app/shared/shared.module';
import { ProgramsModule } from '../programs/programs.module';
import { UncategorizedOfferListComponent } from './list/uncategorized-offer-list.component';
import { UncategorizedOfferManageComponent } from './manage/uncategorized-offer-manage/uncategorized-offer-manage.component';
import { UncategorizedOfferSummaryComponent } from './manage/uncategorized-offer-manage/uncategorized-offer-summary/uncategorized-offer-summary.component';
import { UncategorizedOffersRoutingModule } from './uncategorized-offers-routing.module';

@NgModule({
  declarations: [
    UncategorizedOfferListComponent,
    UncategorizedOfferManageComponent,
    UncategorizedOfferSummaryComponent
  ],
  imports: [
    SharedModule,
    UncategorizedOffersRoutingModule,
    ProgramsModule,

  ],
})
export class UncategorizedOffersModule { }
