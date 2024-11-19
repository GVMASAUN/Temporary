import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShowColumnsComponent } from './show-columns.component';
import { VdsLibModule } from '@visa/vds-angular';

@NgModule({
  declarations: [ShowColumnsComponent],
  imports: [CommonModule, VdsLibModule],
  exports: [ShowColumnsComponent]
})
export class ShowColumnsModule {}
