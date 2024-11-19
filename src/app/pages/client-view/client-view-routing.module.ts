import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CardholderComponent } from './cardholder/cardholder.component';
import { ExploreTemplateComponent } from './explore-template/explore-template.component';
import { MerchantComponent } from './merchant/merchant.component';
import { ProgramElementComponent } from './program-element/program-element.component';
// import { UncategorizedOffersComponent } from '../uncategorized-offers/uncategorized-offers.component';

const routes: Routes = [
  // {
  //   path: '',
  //   redirectTo: 'program',
  //   pathMatch: 'full'
  // },

  { path: 'element', component: ProgramElementComponent },
  // { path: 'uncategorized-offers', component: UncategorizedOffersComponent },
  { path: 'merchant', component: MerchantComponent },
  { path: 'cardholder', component: CardholderComponent },
  { path: 'explore-template', component: ExploreTemplateComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClientViewRoutingModule {}
