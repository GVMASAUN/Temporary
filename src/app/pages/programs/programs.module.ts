import { NgModule } from '@angular/core';

import { NgxGraphModule } from '@swimlane/ngx-graph';
import { SharedModule } from 'src/app/shared/shared.module';
import { CreateProgramDialogComponent } from './create-program-dialog/create-program-dialog.component';
import { ProgramsListComponent } from './list/programs-list.component';
import { ProgramBasicsComponent } from './manage/program-basics/program-basics.component';
import { CreateEditEventGroupByTemplateComponent } from './manage/program-event-group/create-edit-event-group-by-template/create-edit-event-group-by-template.component';
import { EventGroupDetailsComponent } from './manage/program-event-group/create-edit-event-group-by-template/event-group-details/event-group-details.component';
import { ConfirmDialogComponent } from './manage/program-event-group/create-edit-event-group/confirm-dialog/confirm-dialog.component';
import { CreateEditEventGroupComponent } from './manage/program-event-group/create-edit-event-group/create-edit-event-group.component';
import { EventGroupBasicsComponent } from './manage/program-event-group/create-edit-event-group/event-group-basics/event-group-basics.component';
import { EventGroupEventsComponent } from './manage/program-event-group/create-edit-event-group/event-group-events/event-group-events.component';
import { EventGroupSummaryComponent } from './manage/program-event-group/create-edit-event-group/event-group-summary/event-group-summary.component';
import { CreateEditEventComponent } from './manage/program-event-group/create-edit-event/create-edit-event.component';
import { AddEventActionComponent } from './manage/program-event-group/create-edit-event/event-actions/add-event-action/add-event-action.component';
import { EventActionsComponent } from './manage/program-event-group/create-edit-event/event-actions/event-actions.component';
import { CompletedEventSelectorDialogComponent } from './manage/program-event-group/create-edit-event/event-conditions/create-edit-condition/completed-event-selector-dialog/completed-event-selector-dialog.component';
import { CreateEditConditionComponent } from './manage/program-event-group/create-edit-event/event-conditions/create-edit-condition/create-edit-condition.component';
import { EventConditionsComponent } from './manage/program-event-group/create-edit-event/event-conditions/event-conditions.component';
import { EventDetailsComponent } from './manage/program-event-group/create-edit-event/event-details/event-details.component';
import { EventRelationshipsComponent } from './manage/program-event-group/create-edit-event/event-relationships/event-relationships.component';
import { EventGroupTemplateSelectorDialogComponent } from './manage/program-event-group/event-group-tamplate-selector-dialog/event-group-template-selector-dialog.component';
import { ImportEventModalComponent } from './manage/program-event-group/import-event-modal/import-event-modal.component';
import { ProgramEventGroupComponent } from './manage/program-event-group/program-event-group.component';
import { EventGroupHistoryComponent } from './manage/program-event-group/shared/event-group-history/event-group-history.component';
import { ProgramManageComponent } from './manage/program-manage.component';
import { ProgramSummaryComponent } from './manage/program-summary/program-summary.component';
import { ProgramBuilderGraphComponent } from './manage/visual-builder/program-builder-graph/program-builder-graph.component';
import { ProgramBuilderSidePanelComponent } from './manage/visual-builder/program-builder-side-panel/program-builder-side-panel.component';
import { ProgramVisualBuilderComponent } from './manage/visual-builder/program-visual-builder.component';
import { PrequisitesModalComponent } from './prequisites-modal/prequisites-modal.component';
import { ProgramsRoutingModule } from './programs-routing.module';
import { EventGroupErrorsComponent } from './manage/program-event-group/create-edit-event-group/event-group-summary/event-group-errors/event-group-errors.component';

@NgModule({
  declarations: [
    ProgramsListComponent,
    PrequisitesModalComponent,
    ProgramBasicsComponent,
    CreateProgramDialogComponent,
    ProgramVisualBuilderComponent,
    ProgramBuilderGraphComponent,
    ProgramBuilderSidePanelComponent,
    CreateEditEventComponent,
    CreateEditEventGroupComponent,
    ProgramSummaryComponent,
    ProgramEventGroupComponent,
    EventGroupBasicsComponent,
    EventGroupSummaryComponent,
    EventGroupEventsComponent,
    EventGroupHistoryComponent,
    EventDetailsComponent,
    EventRelationshipsComponent,
    EventActionsComponent,
    ProgramManageComponent,
    ImportEventModalComponent,
    EventConditionsComponent,
    CreateEditConditionComponent,
    AddEventActionComponent,
    ConfirmDialogComponent,
    EventGroupTemplateSelectorDialogComponent,
    CreateEditEventGroupByTemplateComponent,
    EventGroupDetailsComponent,
    CompletedEventSelectorDialogComponent,
    EventGroupErrorsComponent,
  ],
  imports: [
    SharedModule,
    ProgramsRoutingModule,
    NgxGraphModule
  ],
  exports: [
    EventGroupSummaryComponent,
    EventDetailsComponent,
    EventConditionsComponent,
    EventRelationshipsComponent,
    EventActionsComponent,
    AddEventActionComponent
  ]
})
export class ProgramsModule { }
