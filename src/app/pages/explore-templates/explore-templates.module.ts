import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ExploreTemplatesRoutingModule } from './explore-templates-routing.module';
import { ExploreTemplatesListComponent } from './list/explore-templates-list.component';
import { SharedModule } from 'src/app/components/shared.module';
import { VdsLibModule } from '@visa/vds-angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CreateEpmTemplateComponent } from './create/create-epm-template.component';
import { ExploreTemplateDetailsComponent } from './shared/details/explore-template-details.component';
import { EditMessageFieldsComponent } from './shared/details/edit-message-fields/edit-message-fields.component';
import { ManageEpmTemplateComponent } from './manage/manage-epm-template.component';
import { ExploreTemplateHistoryComponent } from './shared/history/explore-template-history.component';
import { LinkedEventGroupComponent } from './shared/linked-event-groups/linked-event-group.component';
import { ProgramsModule } from '../programs/programs.module';


@NgModule({
  declarations: [
    ExploreTemplatesListComponent,
    CreateEpmTemplateComponent,
    ExploreTemplateDetailsComponent,
    EditMessageFieldsComponent,
    ManageEpmTemplateComponent,
    ExploreTemplateHistoryComponent,
    LinkedEventGroupComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    ExploreTemplatesRoutingModule,
    ProgramsModule
  ]
})
export class ExploreTemplatesModule { }
