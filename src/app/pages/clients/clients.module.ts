import { NgModule } from '@angular/core';

import { SharedModule } from 'src/app/shared/shared.module';
import { ClientListComponent } from './client-list/client-list.component';
import { ClientsRoutingModule } from './clients-routing.module';
import { ClientSelectDialogComponent } from './dialog/client-select-dialog.component';

@NgModule({
  declarations: [
    ClientListComponent,
    ClientSelectDialogComponent,
    ClientListComponent
  ],
  imports: [

    ClientsRoutingModule,
    SharedModule,
  ]
})
export class ClientsModule { }
