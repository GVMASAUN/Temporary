import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AccordionComponent, AlertType, BadgeType } from '@visa/vds-angular';
import { COLON_SEPARATOR, COMMA_SEPARATOR, DateTimeFormat, VisaIcon, VisaImage, WorkFlowAction } from 'src/app/core/constants';
import { STATUS_BADGE_TYPE, STATUS_DESC, StatusCode } from 'src/app/core/models/status.model';
import { UserRole } from 'src/app/core/models/user.model';
import { EventGroup, EventGroupStep } from 'src/app/pages/programs/event-group.model';
import { EVENT_ACTION_FULFILLMENT_MONETARY_TYPE_DESC, Event, EventAction, EventActionFulfillmentMonetaryType, EventActionType, EventCondition, EventType, RECURRENCE_LIMIT_DESC, RecurrenceLimit } from 'src/app/pages/programs/event.model';
import {
  DialogMode, Program
} from 'src/app/pages/programs/program.model';
import { EventActionService } from 'src/app/services/program/event-action/event-action.service';
import { EventGroupService } from 'src/app/services/program/event-group/event-group.service';
import { EventService } from 'src/app/services/program/event/event.service';
import { ProgramService } from 'src/app/services/program/program.service';
import { FunctionsService } from 'src/app/services/util/functions.service';
import { Utils } from 'src/app/services/utils';
import { CommentsModalComponent } from 'src/app/shared/comments-modal/comments-modal.component';
import { EntityType } from 'src/app/shared/comments-modal/comments-modal.model';
import { CreateEditEventComponent } from '../../create-edit-event/create-edit-event.component';
import { CreateEditEventGroupComponent } from '../create-edit-event-group.component';
import { EventGroupErrorsComponent } from './event-group-errors/event-group-errors.component';
import { DateUtils } from 'src/app/services/util/dateUtils';


@Component({
  selector: 'app-event-group-summary',
  templateUrl: './event-group-summary.component.html',
  styleUrls: ['./event-group-summary.component.scss']
})
export class EventGroupSummaryComponent implements OnInit, AfterViewInit {
  @ViewChildren(AccordionComponent)
  accordions!: QueryList<AccordionComponent>;

  @Input()
  form!: UntypedFormGroup;

  @Input()
  mode: DialogMode = DialogMode.CREATE;

  @Input()
  showEventGroupDetailsButton: boolean = false;

  @Input()
  showEventDetailsButton: boolean = true;

  @Input()
  showDeactivatedEventGroupSummary: boolean = false;

  @Input()
  isPreviouslyPublished: boolean = false;

  @Input()
  disabledApproveOrReject: boolean = false;

  @Input()
  isTemplateEventGroup: boolean = false;

  @Input()
  isProgramSummaryView: boolean = false;

  @Input()
  editable: boolean = true;

  @Input()
  isPublishedEventGroup: boolean = false;

  @Input()
  userRole!: UserRole;

  @Input()
  currentUserId!: string;

  @Input()
  scrollViewId!: string;

  @Input()
  eventList: Event[] = [];

  @Output()
  workflowChangeEmitter: EventEmitter<WorkFlowAction> = new EventEmitter();

  @Output()
  eventWorkflowChangeEmitter: EventEmitter<{ event: Event, action: WorkFlowAction }> = new EventEmitter();


  STATUS_BADGE_TYPE = STATUS_BADGE_TYPE;
  STATUS_DESC = STATUS_DESC;
  RECURRENCE_LIMIT_DESC = RECURRENCE_LIMIT_DESC;
  BadgeType = BadgeType;
  RecurrenceLimit = RecurrenceLimit;
  StatusCode = StatusCode;
  DateTimeFormat = DateTimeFormat;
  DialogMode = DialogMode;
  EventActionFulfillmentMonetaryType = EventActionFulfillmentMonetaryType;
  EventActionType = EventActionType;
  UserRole = UserRole;
  Utils = Utils;
  DateUtils = DateUtils;
  WorkFlowAction = WorkFlowAction;
  VisaIcon = VisaIcon;
  VisaImage = VisaImage;
  EventType = EventType;
  AlertType = AlertType;


  disableAccordion: boolean = false;


  get eventGroup(): EventGroup {
    return this.form.getRawValue() as EventGroup;
  }

  get disableApproveOrRejectDeactivation(): boolean {
    return (
      this.eventGroup?.modifiedUserId === this.currentUserId ||
      this.userRole === UserRole.CLIENT_READ_ONLY ||
      this.userRole === UserRole.CLIENT_NO_RESTRICTED_FIELDS ||
      this.userRole === UserRole.CLIENT
    );
  }

  constructor(
    private eventGroupService: EventGroupService,
    private eventService: EventService,
    private eventActionService: EventActionService,
    private functionService: FunctionsService,
    private dialog: MatDialog,
    private programService: ProgramService
  ) { }

  ngAfterViewInit(): void {
    if (!this.isTemplateEventGroup && !!this.scrollViewId) {
      setTimeout(() => {
        this.functionService.expandAccordionItems(true, this.accordions);

      },);
      this.functionService.scrollToView(this.scrollViewId);
    }
  }

  ngOnInit(): void {
    this.form.get("eventStageList")?.updateValueAndValidity();
  }

  expandAccordionItems(expand: boolean = true) {
    this.functionService.expandAccordionItems(expand, this.accordions);
  }

  getComparisonValues(condition: EventCondition): string {
    return this.eventGroupService.getComparisonValues(condition);
  }

  getCustomFields(eventAction: any): string {
    const customFieldValueList = eventAction.customFieldValueList || [];

    return customFieldValueList.map((field: any) => {
      return `${field.key}${COLON_SEPARATOR}${field.value}`;
    }).join(COMMA_SEPARATOR);
  }

  getEventsToDisplay() {
    return this.isTemplateEventGroup ? this.eventList : this.eventGroup?.eventStageList || [];
  }

  openEventDialog(eventDetails: Event) {
    const eventStatus = !!eventDetails.eventStatus;
    const dialogMode = eventStatus ? DialogMode.EDIT : DialogMode.VIEW;
    const program: Program = this.form.getRawValue() as Program;

    const isTemplateEventGroup = !!this.eventGroup.eventGroupTemplateId;

    this.dialog.closeAll();

    if (isTemplateEventGroup) {
      this.eventGroupService.openEventGroupByTemplateDialog(
        {
          dialogMode: DialogMode.EDIT,
          eventGroupId: this.eventGroup.eventGroupId!,
          eventGroupTemplateId: this.eventGroup?.eventGroupTemplateId,
          programStageId: program.programStageId!,
          viewId: this.eventService.getEventAccordionViewId(eventDetails),
          isPublished: this.isPublishedEventGroup
        }
      );
    } else {
      this.eventService.setEventDialogConfigData(
        dialogMode,
        eventDetails!,
        true,
        this.eventGroupService.getEventGroupDialogConfigData(),
        EventGroupStep.SUMMARY
      );

      this.dialog.open(
        CreateEditEventComponent,
        {
          width: "1250px",
          hasBackdrop: true,
          disableClose: true,
          ariaLabel: 'create-edit-event-dialog'
        }
      );
    }
  }

  openEventGroupDialog() {
    const program: Program = this.form.getRawValue() as Program;

    const isTemplateEventGroup = !!this.eventGroup.eventGroupTemplateId;
    const eventGroupStatus = !!this.eventGroup.eventGroupStatus || StatusCode.DRAFT;
    const dialogMode = eventGroupStatus === StatusCode.DRAFT ? DialogMode.EDIT : DialogMode.VIEW;

    this.dialog.closeAll();

    if (isTemplateEventGroup) {
      this.eventGroupService.openEventGroupByTemplateDialog(
        {
          dialogMode: dialogMode,
          eventGroupId: this.eventGroup.eventGroupId!,
          eventGroupTemplateId: this.eventGroup.eventGroupTemplateId,
          workflowVersionNumber: this.eventGroup.workflowVersionNumber!,
          programStageId: program.programStageId!,
          isPublished: this.isPublishedEventGroup
        }
      );
    } else {

      this.eventGroupService.setEventGroupDialogConfigData(
        dialogMode,
        this.eventGroup,
        program,
        null,
        !this.isPublishedEventGroup
      );

      this.dialog.open(
        CreateEditEventGroupComponent,
        {
          hasBackdrop: true,
          disableClose: true,
          width: '1250px',
          ariaLabel: 'create-edit-event-group-dialog'
        }
      );
    }
  }

  rewardType(action: EventAction) {
    return EVENT_ACTION_FULFILLMENT_MONETARY_TYPE_DESC[action.fulfillmentMonetaryType!];
  }

  showComments(eventDetails: Event) {
    const eventId = eventDetails?.eventStageId!;
    const params: any = {
      communityCode: this.programService.communityCode,
      workflowVersion: this.eventGroup.workflowVersionNumber
    }

    const callback = this.eventService.getEventMessages(eventId, params);

    const onSaveCallback = (comment: string) => {

      const params: any = {
        communityCode: this.programService.communityCode,
        entityId: eventDetails?.eventStageId,
        parentEntityId: this.eventGroup.eventGroupId,
        workflowVersionNumber: this.eventGroup.workflowVersionNumber,
        comment: comment
      }

      return this.eventService.postEventMessage(params);
    }

    const onCloseCallback = (dialogRef: MatDialogRef<CommentsModalComponent>) => {
      dialogRef.close();
    }

    this.dialog.open(
      CommentsModalComponent, {
      hasBackdrop: true,
      disableClose: true,
      ariaLabel: 'comment-modal-dialog',
      data: {
        callback: callback,
        onSaveCallback: onSaveCallback,
        onCloseCallback: onCloseCallback,
        entityType: EntityType.EVENT,
        dialogTitle: eventDetails?.eventName,
        saveComments: !this.isPreviouslyPublished
      }
    });
  }

  showErrors() {
    this.dialog.open(EventGroupErrorsComponent, {
      hasBackdrop: true,
      disableClose: true,
      ariaLabel: 'event-group-errors-dialog',
      width: '1180px',
      data: {
        title: this.eventGroup.eventGroupName,
        dataSource: this.eventGroup.errorMessages
      }
    });
  }

  getEventAccordionViewId(event: Event): string {
    return this.eventService.getEventAccordionViewId(event);
  }

  getEventActionAccordionViewId(eventAction: EventAction): string {
    return this.eventActionService.getEventActionAccordionViewId(eventAction);
  }

}
