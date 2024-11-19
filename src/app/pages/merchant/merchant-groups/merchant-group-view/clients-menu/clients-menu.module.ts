import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientsMenuComponent } from './clients-menu.component';
import { VdsLibModule } from '@visa/vds-angular';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [ClientsMenuComponent],
  imports: [
    CommonModule,
    VdsLibModule,
    RouterModule,
    SharedModule
  ]
})
export class ClientsMenuModule {}
