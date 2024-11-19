import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { VdsLibModule } from '@visa/vds-angular';
import { SharedModule } from 'src/app/shared/shared.module';
import { ArchiveDialogComponent } from './archive-dialog/archive-dialog.component';
import { BasicsMenuComponent } from './basics-menu.component';
import { CloneDialogComponent } from './clone-dialog/clone-dialog.component';

@NgModule({
  declarations: [BasicsMenuComponent, CloneDialogComponent, ArchiveDialogComponent],
  imports: [
    CommonModule,
    VdsLibModule,
    SharedModule,
    RouterModule
  ]
})
export class BasicsMenuModule {}
