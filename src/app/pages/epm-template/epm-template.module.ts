import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SharedModule } from 'src/app/shared/shared.module';
import { ProgramsModule } from '../programs/programs.module';
import { CreateEpmTemplateComponent } from './create/create-epm-template.component';
import { EpmTemplateRoutingModule } from './epm-template-routing.module';
import { EpmTemplateListComponent } from './list/epm-template-list.component';
import { ManageEpmTemplateComponent } from './manage/manage-epm-template.component';
import { AddEditMessageFieldsDialogComponent } from './shared/details/add-edit-message-fields-dialog/add-edit-message-fields-dialog.component';
import { EpmTemplateDetailsComponent } from './shared/details/epm-template-details.component';
import { EpmTemplateHistoryComponent } from './shared/history/epm-template-history.component';
import { LinkedEventGroupComponent } from './shared/linked-event-groups/linked-event-group.component';


@NgModule({
  declarations: [
    EpmTemplateListComponent,
    CreateEpmTemplateComponent,
    EpmTemplateDetailsComponent,
    AddEditMessageFieldsDialogComponent,
    ManageEpmTemplateComponent,
    EpmTemplateHistoryComponent,
    LinkedEventGroupComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    EpmTemplateRoutingModule,
    ProgramsModule
  ]
})
export class EpmTemplateModule { }
