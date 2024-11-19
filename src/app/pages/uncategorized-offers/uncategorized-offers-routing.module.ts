import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UncategorizedOfferListComponent } from './list/uncategorized-offer-list.component';
import { UncategorizedOfferManageComponent } from './manage/uncategorized-offer-manage/uncategorized-offer-manage.component';
import { EMPTY } from 'src/app/core/constants';

const routes: Routes = [
  {
    path: EMPTY,
    component: UncategorizedOfferListComponent
  },
  {
    path: 'manage/:id',
    component: UncategorizedOfferManageComponent,
    data: {title: 'Manage Uncategorized Offers'}
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UncategorizedOffersRoutingModule { }