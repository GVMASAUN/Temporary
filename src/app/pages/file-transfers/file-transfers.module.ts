import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FileTransfersRoutingModule } from './file-transfers-routing.module';
import { DefaultComponent } from './default/default.component';


@NgModule({
  declarations: [
    DefaultComponent
  ],
  imports: [
    CommonModule,
    FileTransfersRoutingModule
  ]
})
export class FileTransfersModule { }
