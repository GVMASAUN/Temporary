import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { VdsLibModule } from '@visa/vds-angular';
import { SharedModule } from 'src/app/shared/shared.module';
import { HistoryDetailsComponent } from './history-details/history-details.component';
import { HistoryMenuComponent } from './history-menu.component';

@NgModule({
  declarations: [HistoryMenuComponent, HistoryDetailsComponent],
  imports: [
    CommonModule,
    VdsLibModule,
    RouterModule,
    SharedModule
  ]
})
export class HistoryMenuModule {}
