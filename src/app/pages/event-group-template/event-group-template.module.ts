import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { ProgramsModule } from '../programs/programs.module';
import { EventGroupTemplateCreateComponent } from './create/event-group-template-create/event-group-template-create.component';
import { EventGroupTemplateRoutingModule } from './event-group-template-routing.module';
import { EventGroupTemplateListComponent } from './list/event-group-template-list/event-group-template-list.component';
import { EventGroupTemplateBasicsComponent } from './shared/event-group-template-basics/event-group-template-basics.component';
import { CreateEditEventGroupTemplateEventDialogComponent } from './shared/event-group-template-events/create-edit-event-group-template-event-dialog/create-edit-event-group-template-event-dialog.component';
import { TemplateEventActionDialogComponent } from './shared/event-group-template-events/create-edit-event-group-template-event-dialog/event-group-template-event-actions/template-event-action-dialog/template-event-action-dialog.component';
import { EventGroupTemplateEventActionsComponent } from './shared/event-group-template-events/create-edit-event-group-template-event-dialog/event-group-template-event-actions/event-group-template-event-actions.component';
import { EventGroupTemplateEventConditionsComponent } from './shared/event-group-template-events/create-edit-event-group-template-event-dialog/event-group-template-event-conditions/event-group-template-event-conditions.component';
import { EventGroupTemplateEventDetailsComponent } from './shared/event-group-template-events/create-edit-event-group-template-event-dialog/event-group-template-event-details/event-group-template-event-details.component';
import { EventGroupTemplateEventRelationshipsComponent } from './shared/event-group-template-events/create-edit-event-group-template-event-dialog/event-group-template-event-relationships/event-group-template-event-relationships.component';
import { EventGroupTemplateEventsComponent } from './shared/event-group-template-events/event-group-template-events.component';
import { EventGroupTemplateManageComponent } from './manage/event-group-template-manage/event-group-template-manage.component';


@NgModule({
  declarations: [
    EventGroupTemplateListComponent,
    EventGroupTemplateCreateComponent,
    EventGroupTemplateManageComponent,
    EventGroupTemplateBasicsComponent,
    EventGroupTemplateEventsComponent,
    CreateEditEventGroupTemplateEventDialogComponent,
    EventGroupTemplateEventDetailsComponent,
    EventGroupTemplateEventConditionsComponent,
    EventGroupTemplateEventRelationshipsComponent,
    EventGroupTemplateEventActionsComponent,
    TemplateEventActionDialogComponent
  ],
  imports: [
    EventGroupTemplateRoutingModule,
    SharedModule,
    ProgramsModule
  ]
})
export class EventGroupTemplateModule { }
