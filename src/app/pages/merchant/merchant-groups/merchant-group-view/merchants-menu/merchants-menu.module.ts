import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { VdsLibModule } from '@visa/vds-angular';
import { SharedModule } from 'src/app/shared/shared.module';
import { MerchantsMenuComponent } from './merchants-menu.component';
import { UpdateDateModalComponent } from './update-date-modal/update-date-modal.component';

@NgModule({
  declarations: [MerchantsMenuComponent, UpdateDateModalComponent],
  imports: [
    CommonModule,
    VdsLibModule,
    RouterModule,
    SharedModule
  ]
})
export class MerchantsMenuModule {}
