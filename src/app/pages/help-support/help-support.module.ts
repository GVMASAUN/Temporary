import { NgModule } from '@angular/core';

import { SharedModule } from 'src/app/shared/shared.module';
import { HelpSupportRoutingModule } from './help-support-routing.module';
import { SupportComponent } from './support/support.component';


@NgModule({
  declarations: [
    SupportComponent
  ],
  imports: [
    HelpSupportRoutingModule,
    SharedModule
  ]
})
export class HelpSupportModule { }
