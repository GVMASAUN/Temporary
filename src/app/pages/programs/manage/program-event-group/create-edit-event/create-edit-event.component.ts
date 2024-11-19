import { Component, Inject, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import {
  ButtonColor,
  ButtonIconType,
  TabsOrientation
} from '@visa/vds-angular';
import { SUCCESS_CODE, VisaIcon } from 'src/app/core/constants';
import { ResponseError } from 'src/app/core/models/pagination-response.model';
import { StatusCode } from 'src/app/core/models/status.model';
import { FormService } from 'src/app/services/form-service/form.service';
import { NavStatusService } from 'src/app/services/nav-status/nav-status.service';
import { EventActionService } from 'src/app/services/program/event-action/event-action.service';
import { EventGroupService } from 'src/app/services/program/event-group/event-group.service';
import { EventService } from 'src/app/services/program/event/event.service';
import { ToggleAlertService } from 'src/app/services/toggle-alert/toggle-alert.service';
import { FunctionsService } from 'src/app/services/util/functions.service';
import { Utils } from 'src/app/services/utils';
import { EventGroup, EventGroupStep, EventGroupVersion } from '../../../event-group.model';
import { Event, EventStep } from '../../../event.model';
import {
  DialogMode,
  Program
} from '../../../program.model';
import { CreateEditEventGroupComponent } from '../create-edit-event-group/create-edit-event-group.component';
import { EventDetailsComponent } from './event-details/event-details.component';
import { EventRelationshipsComponent } from './event-relationships/event-relationships.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { GarbageCollectorService } from 'src/app/services/garbage-collector.service';
import { UserRole } from 'src/app/core/models/user.model';
import { AuthorizationService } from 'src/app/services/authorization.service';
import { ActivatedRoute } from '@angular/router';
import { EntityType } from 'src/app/shared/comments-modal/comments-modal.model';
import { CommentsModalComponent } from 'src/app/shared/comments-modal/comments-modal.component';
import * as moment from 'moment';
import { ProgramService } from 'src/app/services/program/program.service';
import { DialogService } from 'src/app/services/dialog/dialog.service';

@Component({
  selector: 'app-create-edit-event',
  templateUrl: './create-edit-event.component.html',
  styleUrls: ['./create-edit-event.component.scss']
})
export class CreateEditEventComponent implements OnInit, OnDestroy {
  @ViewChild(EventRelationshipsComponent)
  eventRelationships!: EventRelationshipsComponent;

  @ViewChild(EventDetailsComponent)
  eventDetailsComponent!: EventDetailsComponent;

  readonly viewName = "create-edit-event";
  private destroy$ = new Subject<void>();

  ButtonColor = ButtonColor;
  DialogMode = DialogMode;
  TabsOrientation = TabsOrientation;
  ButtonIconType = ButtonIconType;
  EventStep = EventStep;
  UserRole = UserRole;
  VisaIcon = VisaIcon;

  mode: DialogMode = DialogMode.CREATE;

  userRole!: UserRole;
  eventDetails!: Event | null;
  selectedEventGroupVersion!: EventGroupVersion;
  eventGroup!: EventGroup;
  program!: Program;
  eventGroupDialogMode!: DialogMode;

  eventForm: UntypedFormGroup = this.formBuilder.group(new Event());

  openEventGroupDialog: boolean = false;
  initializeForm: boolean = false;
  showLoader: boolean = false;
  initTab: boolean = true;

  selectedTabIndex = 0;

  tabs: any[] = [];

  getTabId: Function = this.functionService.getTabId;
  getTabLabelledById: Function = this.functionService.getTabLabelledById;

  get event(): Event {
    return this.eventForm.getRawValue() as Event;
  }

  get disabled(): boolean {
    return (this.mode === DialogMode.VIEW) || (this.event.eventStatus === StatusCode.PENDING_REVIEW);
  }

  get showCloseButton(): boolean {
    return this.selectedTabIndex === this.tabs.indexOf(EventStep.EVENT_CONDITIONS) ||
      this.selectedTabIndex === this.tabs.indexOf(EventStep.EVENT_ACTION);
  }

  get title(): string {
    let title = 'Event';
    if (this.mode === DialogMode.CREATE) {
      title = `${title} - Creating`;
    }
    if (this.mode === DialogMode.EDIT) {
      title = `${title} - Editing`;
    }
    if (this.mode === DialogMode.VIEW) {
      title = `${title} - View`;
    }

    return title;
  }

  constructor(
    private route: ActivatedRoute,
    private formBuilder: UntypedFormBuilder,
    private formService: FormService,
    private eventService: EventService,
    private programService: ProgramService,
    private toggleAlertService: ToggleAlertService,
    private eventGroupService: EventGroupService,
    private eventActionService: EventActionService,
    private functionService: FunctionsService,
    private navStatusService: NavStatusService,
    private authorizationService: AuthorizationService,
    private dialog: MatDialog,
    private dialogService: DialogService,
    private dialogRef: MatDialogRef<CreateEditEventComponent>,
    private viewContainerRef: ViewContainerRef,
    @Inject(MAT_DIALOG_DATA) private dialogConfig: any

  ) {
    this.userRole = this.authorizationService.getUserRole();

    this.dialogService.setDialogEventListeners(
      this.dialogRef,
      () => { this.dialogRef.close(); }
    ).pipe(takeUntil(this.destroy$)).subscribe();
  }


  private initUiRelatedData(eventDetails: Event | null = null, callback: Function = () => { }) {
    this.initTab = false;
    this.initializeForm = false;

    const eventDialogConfig = this.eventService.getEventDialogConfigData();
    const eventActionDialogConfig = this.eventActionService.getEventActionDialogConfigData();

    if (eventDialogConfig) {
      this.setDialogData(eventDialogConfig);


      if (Utils.isNotNull(eventDetails) && this.mode === DialogMode.CREATE) {
        this.eventDetails = eventDetails;
        this.mode = DialogMode.EDIT;
      }

      if (this.mode === DialogMode.EDIT || this.mode === DialogMode.VIEW) {
        this.getEvent();
        this.tabs = [
          EventStep.EVENT_DETAILS,
          EventStep.EVENT_CONDITIONS,
          EventStep.EVENT_RELATIONSHIPS,
          EventStep.EVENT_ACTION
        ];

      } else {
        this.initEventForm();
        this.tabs = [
          EventStep.EVENT_DETAILS,
          EventStep.EVENT_CONDITIONS,
          EventStep.EVENT_ACTION
        ];
      }

      if (eventActionDialogConfig?.eventDialogSelectedTab) {
        this.setCurrentTab(eventActionDialogConfig?.eventDialogSelectedTab);
        eventActionDialogConfig.eventDialogSelectedTab = null;
      }

    }

    setTimeout(
      () => {
        callback();
        this.initTab = true;
      },
      0
    );
  }

  private setDialogData(data: any) {
    this.mode = data?.dialogMode;
    this.eventDetails = data?.event;
    this.openEventGroupDialog = data?.openEventGroupDialog;

    const eventGroupDialogConfigData = data?.eventGroupDialogConfigData;

    if (eventGroupDialogConfigData) {
      this.eventGroup = eventGroupDialogConfigData?.eventGroup;
      this.selectedEventGroupVersion = eventGroupDialogConfigData?.selectedEventGroupVersion;
      this.eventGroupDialogMode = eventGroupDialogConfigData?.dialogMode;
      this.program = eventGroupDialogConfigData?.program;
    }
  }

  private initEventForm() {
    if (this.eventGroup) {
      this.eventForm
        .get('communityCode')
        ?.patchValue(this.eventGroup.communityCode);
      this.eventForm
        .get('eventGroupId')
        ?.patchValue(this.eventGroup.eventGroupId);

      this.eventForm
        .get('eventStartDate')
        ?.patchValue(this.eventGroup.eventGroupStartDate);
      this.eventForm
        .get('eventEndDate')
        ?.patchValue(this.eventGroup.eventGroupEndDate);
      this.eventForm.get('startTime')?.patchValue(this.eventGroup.startTime);
      this.eventForm.get('endTime')?.patchValue(this.eventGroup.endTime);

      this.initializeForm = true;
    }
  }

  private getEvent() {
    if (this.eventDetails) {
      this.eventService
        .getEvent(this.eventDetails.eventStageId)
        .pipe(takeUntil(this.destroy$))
        .subscribe(response => {
          if ((response.statusCode === SUCCESS_CODE) && Utils.isNull(response.errors)) {
            this.mapEvent(response.data);
          }
        });
    }
  }

  private mapEvent(event: Event) {
    this.initializeForm = false;

    this.eventForm.patchValue(event);
    this.formService.clearFormControlValidators(this.eventForm);
    this.eventForm.markAsPristine();

    this.initializeForm = true;
  }

  private openEventSelectorDialog(isCancel = false) {
    if (this.openEventGroupDialog) {
      this.dialog.closeAll();

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

  private setErrorMessages(responseErrors: ResponseError[]) {
    this.toggleAlertService.showResponseErrors(responseErrors);

    this.eventService.updateErrorMessages(responseErrors, this.eventForm);
  }

  private setAlertMessage() {
    this.toggleAlertService.showSuccessMessage(
      this.mode === DialogMode.CREATE
        ? `Event added successfully.`
        : `Event updated successfully.`
    );
  }

  private setCurrentTab(eventStep: EventStep) {
    this.selectedTabIndex = this.tabs.indexOf(eventStep);
  }

  public handleAfterExit() {
    this.dialogRef.close();
    this.openEventSelectorDialog(true);
  }

  private createOrUpdateEvent(isSaveAndExit: boolean) {
    const isValid = this.eventDetailsComponent.validate();

    if (isValid) {
      let callback;

      const payload = this.eventForm.getRawValue();

      if (this.mode === DialogMode.CREATE) {
        callback = this.eventService.createEvent(payload);
      } else {
        callback = this.eventService.updateEvent(this.event.eventStageId, payload);
      }

      this.showLoader = true;

      callback.pipe(takeUntil(this.destroy$)).subscribe({
        next: response => {
          this.showLoader = false;
          if ((response.statusCode === SUCCESS_CODE) && Utils.isNull(response.errors)) {
            this.eventService.emitReloadEvent(true);

            this.setAlertMessage();

            if (isSaveAndExit) {
              this.handleAfterExit();
            } else {
              this.eventDetails = response.data;
              if (this.eventDetails) {
                this.mode = DialogMode.EDIT;
                this.eventService.setEventDialogConfigData(
                  this.mode,
                  this.eventDetails!,
                  this.openEventGroupDialog,
                  this.eventGroupService.getEventGroupDialogConfigData(),
                  EventGroupStep.EVENTS
                );

                this.init();
              }
            }
          } else {
            this.setErrorMessages(response.errors);
          }
        },
        error: err => {
          this.showLoader = false;
          console.log(err);
        }
      });
    } else {
      this.toggleAlertService.showError();
    }
  }


  ngOnInit(): void {
    this.eventService.emitReloadEvent(false);

    this.init();
  }

  public init() {
    this.initUiRelatedData();
  }


  save() {
    this.createOrUpdateEvent(false);
  }

  saveAndExit() {
    this.createOrUpdateEvent(true);
  }

  delete() { }

  closeDialog() {
    // Added a timeout to handle the "enter" event bug for VGAR requirement. 
    // On closing the "enter" event, it was causing an open dialog after close; hence, a timeout was added.

    setTimeout(() => {
      this.dialogRef?.close();
    }, 150);

    this.openEventSelectorDialog(true);
  }

  onTabChange(event: any) {
    this.navStatusService.togglePanel(false);
  }

  getDisabledStartDateTimeMessage(): string | null {
    return this.programService.getDisabledStartDateTimeMessage(this.eventGroup, this.mode);
  }

  getDisabledEndDateTimeMessage(): string | null {
    return this.programService.getDisabledEndDateTimeMessage(this.eventGroup, this.mode);
  }

  hideTab(step: EventStep): boolean {
    const selectedIndex = this.tabs.indexOf(step);

    return this.selectedTabIndex !== selectedIndex;
  }

  showComments() {
    const eventId = this.eventDetails?.eventStageId!;
    const params: any = {
      communityCode: this.route.snapshot.queryParams['client'],
      workflowVersion: this.eventGroup.workflowVersionNumber
    }

    const callback = this.eventService.getEventMessages(eventId, params);

    const onSaveCallback = (comment: string) => {

      const params: any = {
        communityCode: this.route.snapshot.queryParams['client'],
        entityId: this.eventDetails?.eventStageId,
        parentEntityId: this.eventGroup.eventGroupId,
        workflowVersionNumber: this.selectedEventGroupVersion?.workflowVersionNumber,
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
        dialogTitle: this.eventDetails?.eventName,
        saveComments: !this.eventGroup.archived
      }
    });
  }

  handleEventConditionSubmitRequest(eventDetails: Event | null = null) {
    this.setAlertMessage();

    this.initUiRelatedData(eventDetails, () => this.setCurrentTab(EventStep.EVENT_CONDITIONS));
  }

  ngOnDestroy(): void {
    this.eventService.emitReloadEvent(false);

    this.destroy$.next();
    this.destroy$.complete();

    GarbageCollectorService.clearDetachedDOMElements(
      this,
      this.viewContainerRef
    );
  }

}