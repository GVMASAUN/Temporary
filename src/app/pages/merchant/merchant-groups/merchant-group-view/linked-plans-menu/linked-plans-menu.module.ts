import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LinkedPlansMenuComponent } from './linked-plans-menu.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { RouterModule } from '@angular/router';
import { VdsLibModule } from '@visa/vds-angular';

@NgModule({
  declarations: [LinkedPlansMenuComponent],
  imports: [
    CommonModule,
    VdsLibModule,
    RouterModule,
    SharedModule
  ]
})
export class LinkedPlansMenuModule {}
