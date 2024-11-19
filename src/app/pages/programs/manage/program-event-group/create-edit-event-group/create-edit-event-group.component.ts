import { Component, Inject, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import {
  ButtonColor,
  ButtonIconType,
  TabsOrientation
} from '@visa/vds-angular';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  DateTimeFormat,
  EMPTY,
  SUCCESS_CODE,
  VisaIcon,
  WorkFlowAction
} from 'src/app/core/constants';
import { PaginationResponse, ResponseError } from 'src/app/core/models/pagination-response.model';
import { StatusCode } from 'src/app/core/models/status.model';
import { UserRole } from 'src/app/core/models/user.model';
import {
  DialogMode,
  Program
} from 'src/app/pages/programs/program.model';
import { AuthorizationService } from 'src/app/services/authorization.service';
import { FormService } from 'src/app/services/form-service/form.service';
import { GarbageCollectorService } from 'src/app/services/garbage-collector.service';
import { EventGroupService } from 'src/app/services/program/event-group/event-group.service';
import { EventService } from 'src/app/services/program/event/event.service';
import { ProgramService } from 'src/app/services/program/program.service';
import { ToggleAlertService } from 'src/app/services/toggle-alert/toggle-alert.service';
import { FunctionsService } from 'src/app/services/util/functions.service';
import { Utils } from 'src/app/services/utils';
import { CommentsModalComponent } from 'src/app/shared/comments-modal/comments-modal.component';
import { CommentModalConfig, EntityType } from 'src/app/shared/comments-modal/comments-modal.model';
import { EventGroup, EventGroupStep, EventGroupVersion } from '../../../event-group.model';
import { Event } from '../../../event.model';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { EventGroupBasicsComponent } from './event-group-basics/event-group-basics.component';
import { DialogService } from 'src/app/services/dialog/dialog.service';

@Component({
  selector: 'app-create-edit-event-group',
  templateUrl: './create-edit-event-group.component.html',
  styleUrls: ['./create-edit-event-group.component.scss'],
})
export class CreateEditEventGroupComponent implements OnInit, OnDestroy {
  @ViewChild(EventGroupBasicsComponent)
  eventGroupBasicComponent!: EventGroupBasicsComponent;

  private destroy$ = new Subject<void>();


  ButtonColor = ButtonColor;
  DateFormat = DateTimeFormat;
  DialogMode = DialogMode;
  TabsOrientation = TabsOrientation;
  ButtonIconType = ButtonIconType;
  EventGroupStep = EventGroupStep;
  UserRole = UserRole;
  StatusCode = StatusCode;
  VisaIcon = VisaIcon;

  mode: DialogMode = DialogMode.CREATE;
  eventGroupDetails!: EventGroup;
  eventGroupVersions!: EventGroupVersion[];
  program!: Program;

  eventGroupForm = this.formBuilder.group(new EventGroup());

  initializeForm: boolean = false;
  showLoader: boolean = false;
  initTab: boolean = false;
  expandEvents: boolean = false;
  showEditButton: boolean = false;
  isDraftAvailable!: boolean;

  selectedTabIndex: number = -1;
  selectedWorkflowVersionNumber: number = -1;
  expandedEventIndex: number = -1;
  previouslySelectedVersionNumber!: number;
  selectedWorkflowVersion!: EventGroupVersion;
  eventDialogConfigData: any;

  currentUserId!: string;
  selectTab!: string;

  userRole!: UserRole;

  confirmDialogRef!: MatDialogRef<ConfirmDialogComponent>;

  tabs: string[] = [];

  readonly viewName = "create-edit-event-group";

  getTabId: Function = this.functionService.getTabId;
  getTabLabelledById: Function = this.functionService.getTabLabelledById;

  afterCallBack = (submitRequest: boolean) => {
    this.confirmDialogRef.close();

    if (submitRequest) {
      this.dialog.closeAll();

      this.dialog.open(
        CreateEditEventGroupComponent,
        {
          hasBackdrop: true,
          width: '1250px',
          disableClose: true,
          ariaLabel: 'create-edit-event-group-dialog',
          data: this.dialogConfig
        }
      );
    }
  };


  get eventGroup(): EventGroup {
    return this.eventGroupForm.getRawValue() as EventGroup;
  }

  get title(): string {
    let title = 'Event Group';

    if (this.mode === DialogMode.CREATE) {
      title = `${title} - Creating`;
    }
    if (this.mode === DialogMode.EDIT) {
      title = `${title} - Editing`;
    }
    if (this.mode === DialogMode.VIEW || this.mode === DialogMode.SUMMARY) {
      title = `${title} - View`;
    }

    return title;
  }

  get disabled(): boolean {
    return (this.mode === DialogMode.VIEW)
      || this.editableForApproveVersion;
  }

  get disabledApproveOrReject(): boolean {
    return (
      (this.mode === DialogMode.CREATE) ||
      this.eventGroup?.modifiedUserId === this.currentUserId ||
      this.userRole === UserRole.CLIENT_READ_ONLY ||
      this.userRole === UserRole.CLIENT_NO_RESTRICTED_FIELDS ||
      this.userRole === UserRole.CLIENT ||
      this.disabled
    );
  }

  get disabledPublish(): boolean {
    return (
      (this.mode === DialogMode.CREATE) ||
      (this.userRole === UserRole.CLIENT_READ_ONLY) ||
      (this.userRole === UserRole.CLIENT_NO_RESTRICTED_FIELDS) ||
      (this.userRole === UserRole.CLIENT) ||
      (this.userRole === UserRole.CLIENT_REVIEWER)
    );
  }

  get editable(): boolean {
    return this.eventGroup?.eventGroupStatusCode !== StatusCode.PENDING_REVIEW
      && this.eventGroup?.eventGroupStatusCode !== StatusCode.PENDING_DEACTIVATION_REVIEW
  }

  get showCloseButton(): boolean {
    return this.selectedTabIndex !== this.tabs.indexOf(EventGroupStep.BASICS) || !this.editable || this.editableForApproveVersion;
  }

  get isPublishedVersion(): boolean {
    return !!this.selectedWorkflowVersion?.publishedVersion;
  }


  get editableForApproveVersion(): boolean {
    return (this.selectedWorkflowVersion?.eventGroupStatusCode === StatusCode.APPROVED) && this.showEditButton;
  }

  constructor(
    private route: ActivatedRoute,
    private formBuilder: UntypedFormBuilder,
    private formService: FormService,
    private programService: ProgramService,
    private eventGroupService: EventGroupService,
    private toggleAlertService: ToggleAlertService,
    private eventService: EventService,
    private authorizationService: AuthorizationService,
    private functionService: FunctionsService,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<CreateEditEventGroupComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogConfig: any,
    private viewContainerRef: ViewContainerRef,
    private dialogService: DialogService

  ) {
    this.userRole = this.authorizationService.getUserRole();
    this.currentUserId = this.authorizationService.getUserId();

    this.dialogService.setDialogEventListeners(
      this.dialogRef,
      () => { this.close(); }
    ).pipe(takeUntil(this.destroy$)).subscribe();
  }

  onTabChange(tabIndex: number) {
    this.selectedTabIndex = tabIndex;
  }

  getDisabledStartDateTimeMessage(): string | null {
    return this.programService.getDisabledStartDateTimeMessage(this.eventGroup, this.mode);
  }

  getDisabledEndDateTimeMessage(): string | null {
    return this.programService.getDisabledEndDateTimeMessage(this.eventGroup, this.mode);
  }

  ngOnInit(): void {
    this.eventGroupService.emitReloadEventGroup(false);

    this.init();
  }

  private initTabs() {
    this.tabs = [
      EventGroupStep.SUMMARY,
      EventGroupStep.BASICS,
      EventGroupStep.EVENTS
    ];

    if (this.mode !== DialogMode.CREATE) {
      this.tabs.push(EventGroupStep.HISTORY);
    }
    this.initTab = true;
    this.setCurrentTab();
  }

  private init(reload: boolean = false) {
    this.initUiRelatedData();

    if (reload) {

      this.getEventGroupVersions(true);

    } else {
      if (this.mode === DialogMode.CREATE) {
        this.initEventGroupForm();
        this.initTabs();
      } else {
        this.getEventGroupVersions();
      }
    }
  }

  private mapDialogConfigData(data: any) {
    this.mode = data.dialogMode;
    this.program = data.program;
    this.eventGroupDetails = data.eventGroup;
    this.selectTab = data?.selectTab;
    this.expandEvents = data?.expandEvents;
    this.expandedEventIndex = data?.expandedEventIndex;

    this.isDraftAvailable = !!data?.isDraftAvailable;
    this.selectedWorkflowVersion = data?.selectedEventGroupVersion;
    if (this.selectedWorkflowVersion) {
      this.selectedWorkflowVersionNumber = this.selectedWorkflowVersion.workflowVersionNumber;
    }
  }

  private initEventGroupForm() {
    if (this.program) {
      this.eventGroupForm
        .get('programStageId')
        ?.patchValue(this.program.programStageId);
      this.eventGroupForm
        .get('communityCode')
        ?.patchValue(this.program.communityCode);
      this.eventGroupForm
        .get('eventGroupStatusCode')
        ?.patchValue(StatusCode.DRAFT);
    }

    this.initializeForm = true;
  }

  private moveToPreviouslySelectedTab() {
    if (this.eventDialogConfigData?.eventGroupDialogSelectedTab) {
      this.setCurrentTab(this.tabs.indexOf(this.eventDialogConfigData?.eventGroupDialogSelectedTab));
    } else if (this.selectTab) {
      this.setCurrentTab(this.tabs.indexOf(this.selectTab));
    }
  }

  private initUiRelatedData() {
    const eventGroupDialogConfigData = this.eventGroupService.getEventGroupDialogConfigData();
    this.eventDialogConfigData = this.eventService.getEventDialogConfigData();

    if (eventGroupDialogConfigData) {
      this.mapDialogConfigData(eventGroupDialogConfigData);
      this.moveToPreviouslySelectedTab();
    }
  }

  private setEventGroup(selectedVersion: EventGroupVersion) {
    const programStageId = this.program?.programStageId;
    const eventGroupId = this.eventGroupDetails?.eventGroupId;

    const isPublishedVersion: boolean = (!this.isDraftAvailable || !selectedVersion?.hasDraft) && selectedVersion?.publishedVersion;

    this.getEventGroup(
      programStageId,
      eventGroupId,
      isPublishedVersion,
      selectedVersion
    );
  }

  private getEventGroup(
    programStageId: number | null,
    eventGroupId: number | null,
    isPublishedVersion: boolean = false,
    selectedVersion: EventGroupVersion
  ) {

    this.showLoader = true;
    this.eventGroupService
      .getEventGroup(
        programStageId, eventGroupId,
        isPublishedVersion,
        selectedVersion.workflowVersionNumber
      ).pipe(takeUntil(this.destroy$)).subscribe(
        response => {
          if ((response.statusCode === SUCCESS_CODE) && Utils.isNull(response.errors)) {
            this.mapEventGroup(response.data);

            this.updateTabForSelectedVersion(isPublishedVersion || response.data.archived);

            this.eventGroupService.setEventGroupDialogConfigData(
              this.mode,
              this.eventGroup,
              this.program,
              selectedVersion,
              this.isDraftAvailable,
              undefined
            );

          } else {
            this.toggleAlertService.showResponseErrors(response.errors);
          }

          this.showLoader = false;
        },
        (error: any) => {
          this.showLoader = true;
        }
      );

  }

  private performVersionSelection(versions: any[], selectDraftVersion: boolean = false) {
    const draftVersion = versions.find(v => v.hasDraft);
    const publishedVersion = versions.find(v => v.publishedVersion);

    if (!!this.isDraftAvailable || (!!draftVersion && !publishedVersion) || selectDraftVersion) {
      this.selectedWorkflowVersion = draftVersion || null;

    } else {
      this.selectedWorkflowVersion = publishedVersion || null;
    }

    this.selectedWorkflowVersionNumber = this.selectedWorkflowVersion?.workflowVersionNumber || -1;
  }

  private getEventGroupVersions(reload: boolean = false) {
    const eventGroupId = this.eventGroupDetails?.eventGroupId;
    this.eventGroupVersions = [];

    this.eventGroupService
      .getEventGroupVersions(
        eventGroupId, this.programService.communityCode
      )
      .pipe(takeUntil(this.destroy$)).subscribe(
        response => {

          if ((response.statusCode === SUCCESS_CODE) && Utils.isNull(response.errors)) {
            this.eventGroupVersions = response.data;

            if (reload) {
              this.selectedWorkflowVersionNumber = this.eventGroupVersions[0].workflowVersionNumber;
              if (this.previouslySelectedVersionNumber === this.selectedWorkflowVersionNumber) {
                this.setEventGroup(this.selectedWorkflowVersion);
              }
            } else if (!this.selectedWorkflowVersion) {
              this.performVersionSelection(response.data);
            }

          } else {
            this.toggleAlertService.showResponseErrors(response.errors);
          }
        });
  }


  private mapEventGroup(response: EventGroup) {
    this.initializeForm = false;

    this.showEditButton = response.eventGroupStatusCode === StatusCode.APPROVED


    if (Utils.isNotNull(response)) {
      this.eventGroupForm.patchValue(response);
      this.formService.clearFormControlValidators(this.eventGroupForm);
      this.eventGroupForm.markAsPristine();

      this.initializeForm = true;
    }
  }

  private updateTabForSelectedVersion(isPublishedVersion: boolean) {
    this.initTab = false;

    const isHistoryTabSelected = (this.selectedTabIndex > -1) && (this.selectedTabIndex === this.tabs.indexOf(EventGroupStep.HISTORY));

    if (isPublishedVersion || !this.editable) {

      this.tabs = [
        EventGroupStep.SUMMARY,
        EventGroupStep.HISTORY
      ];

      this.setCurrentTab(isHistoryTabSelected ?
        this.tabs.indexOf(EventGroupStep.HISTORY)
        : this.tabs.indexOf(EventGroupStep.SUMMARY));
    } else {
      this.tabs = [
        EventGroupStep.SUMMARY,
        EventGroupStep.BASICS,
        EventGroupStep.EVENTS,
        EventGroupStep.HISTORY
      ];

      this.setCurrentTab(isHistoryTabSelected ?
        this.tabs.indexOf(EventGroupStep.HISTORY)
        : this.tabs.indexOf(EventGroupStep.BASICS));

      this.moveToPreviouslySelectedTab();
    }

    setTimeout(
      () => {
        this.initTab = true;
      },
      0
    );
  }

  private createOrUpdateEventGroup(isSaveAndExit: boolean) {
    const isValid = this.eventGroupBasicComponent.validate();

    if (isValid) {
      let callback;

      if (this.mode === DialogMode.CREATE) {
        callback = this.eventGroupService.createEventGroup(this.eventGroup);
      } else {
        callback = this.eventGroupService.updateEventGroup(
          this.eventGroup.eventGroupId,
          this.eventGroup
        );
      }

      this.showLoader = true;

      callback.pipe(takeUntil(this.destroy$)).subscribe({
        next: response => {
          this.showLoader = false;
          if ((response.statusCode === SUCCESS_CODE) && Utils.isNull(response.errors)) {
            this.eventGroupService.emitReloadEventGroup(true);

            if (isSaveAndExit) {
              this.close();
            } else {
              this.eventGroupService.setEventGroupDialogConfigData(
                DialogMode.EDIT,
                response.data,
                this.program,
                this.selectedWorkflowVersion,
                this.isDraftAvailable
              );

              this.init(true);
            }

            this.setAlertMessage();
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

  private setErrorMessages(responseErrors: ResponseError[]) {
    this.toggleAlertService.showResponseErrors(responseErrors);

    this.eventGroupService.updateErrorMessages(responseErrors, this.eventGroupForm);
  }

  private setAlertMessage() {
    this.toggleAlertService.showSuccessMessage(
      this.mode === DialogMode.CREATE
        ? `Event Group added successfully.`
        : `Event Group updated successfully.`,
    )
  }

  private performStatusTransition(
    callback: Observable<PaginationResponse<EventGroup>>,
    afterSubmitCallback?: Function
  ) {
    if (callback) {
      this.showLoader = true;

      callback.pipe(takeUntil(this.destroy$)).subscribe({
        next: response => {
          this.showLoader = false;

          if ((response.statusCode === SUCCESS_CODE) && Utils.isNull(response.errors)) {
            this.eventGroupService.emitReloadEventGroup(true);

            this.previouslySelectedVersionNumber = -1;

            if (afterSubmitCallback) {
              afterSubmitCallback(true);
            } else {
              this.init();
            }

            this.setAlertMessage();
          } else {
            this.setErrorMessages(response.errors);
          }
        },
        error: err => {
          this.showLoader = false;
        }
      });
    }
  }

  setCurrentTab(index: number = this.tabs.indexOf(EventGroupStep.BASICS)) {
    this.selectedTabIndex = index;
  }


  private openConfirmDialog(workflow: WorkFlowAction, submitCallback: Function, closeCallback: Function) {
    // this.dialogRef.close({ cancel: true });

    let title = EMPTY;

    if (workflow === WorkFlowAction.REJECT) {
      title = 'Rejection Comment';
    }
    if (workflow === WorkFlowAction.REJECT_DEACTIVATION) {
      title = 'Reason for Deactivation Rejection';
    }
    if ((workflow === WorkFlowAction.SUBMIT_FOR_DEACTIVATE) || (workflow === WorkFlowAction.DEACTIVATE) || (workflow === WorkFlowAction.APPROVE_DEACTIVATION)) {
      title = 'Reason for Deactivation'
    }


    this.confirmDialogRef = this.dialog.open(
      ConfirmDialogComponent,
      {
        hasBackdrop: true, disableClose: true,
        ariaLabel: 'confirm-dialog',
        data: {
          dialogTitle: title,
          submitCallback: submitCallback,
          closeCallback: closeCallback
        },
      });
  }


  handleEventGroupWorkflowChange(workFlowAction: WorkFlowAction) {
    this.showEditButton = false;

    if (WorkFlowAction.SUBMIT_FOR_APPROVAL === workFlowAction) {
      this.performStatusTransition(this.eventGroupService.submitEventGroup(this.eventGroup));
    } else if (WorkFlowAction.APPROVE === workFlowAction) {
      this.performStatusTransition(this.eventGroupService.approveEventGroup(this.eventGroup), () => {
        this.showEditButton = true;
        this.init();
      });
    } else if (WorkFlowAction.PUBLISH === workFlowAction) {
      this.performStatusTransition(this.eventGroupService.publishEventGroup(this.eventGroup));
    } else if (WorkFlowAction.REJECT === workFlowAction) {
      this.openConfirmDialog(workFlowAction, (comment: string) =>
        this.performStatusTransition(
          this.eventGroupService.rejectEventGroup(
            this.eventGroup,
            comment
          ),
          this.afterCallBack
        ),
        this.afterCallBack
      );

    } else if (WorkFlowAction.DISCARD === workFlowAction) {
      const params = {
        programStageId: this.program.programStageId,
        communityCode: this.program.communityCode
      };

      this.eventGroupService.openEventGroupDeleteOrDiscardConfirmDialog(this.eventGroup.eventGroupId, params,
        () => {
          this.init(true);
        },
        false);
    } else if (WorkFlowAction.DELETE === workFlowAction) {
      const params = {
        programStageId: this.program.programStageId,
        communityCode: this.program.communityCode
      };

      this.eventGroupService.openEventGroupDeleteOrDiscardConfirmDialog(this.eventGroup.eventGroupId, params,
        () => {
          this.dialogRef.close();
        },
        true);
    } else if ([
      WorkFlowAction.DEACTIVATE,
      WorkFlowAction.SUBMIT_FOR_DEACTIVATE,
      WorkFlowAction.REJECT_DEACTIVATION,
      WorkFlowAction.APPROVE_DEACTIVATION
    ].includes(workFlowAction)) {
      this.openConfirmDialog(
        workFlowAction,
        (comment: string) => this.performStatusTransition(
          this.eventGroupService.deactivateEventGroup(
            this.eventGroup,
            comment,
            workFlowAction
          ),
          this.afterCallBack
        ),
        this.afterCallBack
      );
    }
  }

  handleEventWorkflowChange(selectedEventAndAction: { event: Event, action: WorkFlowAction }) {
    const workFlowAction: WorkFlowAction = selectedEventAndAction.action;
    const event: Event = selectedEventAndAction.event;

    if (
      WorkFlowAction.DEACTIVATE === workFlowAction ||
      WorkFlowAction.SUBMIT_FOR_DEACTIVATE === workFlowAction ||
      WorkFlowAction.REJECT_DEACTIVATION === workFlowAction ||
      WorkFlowAction.APPROVE_DEACTIVATION === workFlowAction
    ) {
      this.openConfirmDialog(
        workFlowAction,
        (comment: string) => this.performStatusTransition(
          this.eventService.deactivateEvent(
            this.eventGroup,
            event.eventStageId,
            comment,
            workFlowAction
          ),
          this.afterCallBack
        ),
        this.afterCallBack
      );
    }
  }

  handleVersionChange(event: any) {
    const workflowVersion = event?.value;

    if (workflowVersion && (String(this.previouslySelectedVersionNumber) !== String(workflowVersion))) {
      const version = this.eventGroupVersions.find(v => String(v.workflowVersionNumber) === String(event.value));
      this.selectedWorkflowVersion = version! || null;

      this.setEventGroup(version!); // to load selected version Event Group data
    }

    this.previouslySelectedVersionNumber = workflowVersion;
  }

  close() {
    // Added a timeout to handle the "enter" event bug for VGAR requirement. 
    // On closing the "enter" event, it was causing an open dialog after close; hence, a timeout was added.

    setTimeout(() => {
      this.dialogRef.close();
    }, 150);
  }

  changeViewToEdit() {
    if (this.editableForApproveVersion) {
      this.showEditButton = false;
    } else {
      const draftVersion = this.eventGroupVersions.find(v => v.hasDraft);

      if (draftVersion) {
        this.performVersionSelection(this.eventGroupVersions, true);
      } else {
        const programStageId = this.program?.programStageId;
        const eventGroupId = this.eventGroupDetails?.eventGroupId;
        const isPublishedVersion = false;

        this.getEventGroup(programStageId, eventGroupId, isPublishedVersion, this.selectedWorkflowVersion);
      }
    }
  }

  save() {
    this.createOrUpdateEventGroup(false);
  }

  saveAndExit() {
    this.createOrUpdateEventGroup(true);
  }

  hideTab(selectedIndex: number): boolean {
    return this.selectedTabIndex !== selectedIndex;
  }

  showEventDetails() {
    if (this.eventGroupDetails && this.eventGroupDetails.eventGroupTemplateId) {
      return false;
    }

    return !this.selectedWorkflowVersion?.publishedVersion || this.selectedWorkflowVersion?.hasDraft || false;
  }

  showComments() {
    const eventGroupId = this.eventGroupDetails.eventGroupId!;
    const params: any = {
      communityCode: this.route.snapshot.queryParams['client'],
      workflowVersion: this.eventGroup.workflowVersionNumber
    }


    const onSaveCallback = (comment: string) => {

      const params: any = {
        communityCode: this.route.snapshot.queryParams['client'],
        entityId: this.eventGroupDetails.eventGroupId,
        parentEntityId: 0,
        workflowVersionNumber: this.selectedWorkflowVersionNumber,
        comment: comment
      }

      return this.eventGroupService.postEventGroupMessage(params);
    }

    const onCloseCallback = (dialogRef: MatDialogRef<CommentsModalComponent>) => {
      dialogRef.close();
    }

    this.dialog.open(
      CommentsModalComponent, {
      hasBackdrop: true,
      disableClose: true,
      ariaLabel: 'comment-modal-dialog',
      data: new CommentModalConfig(
        this.eventGroupService.getEventGroupMessages(eventGroupId, params),
        onSaveCallback,
        onCloseCallback,
        EntityType.EVENT_GROUP,
        this.eventGroupDetails.eventGroupName!,
        !this.eventGroup.archived
      )
    });
  }

  ngOnDestroy(): void {
    this.eventGroupService.emitReloadEventGroup(false);

    this.destroy$.next();
    this.destroy$.complete();

    GarbageCollectorService.clearDetachedDOMElements(
      this,
      this.viewContainerRef
    );
  }

}