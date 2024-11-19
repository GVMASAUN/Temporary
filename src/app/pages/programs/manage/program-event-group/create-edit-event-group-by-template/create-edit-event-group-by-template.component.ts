import { Component, Inject, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { UntypedFormArray, UntypedFormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { ButtonColor, ButtonIconType, TabsOrientation } from '@visa/vds-angular';
import { Observable, Subject } from 'rxjs';
import { distinctUntilChanged, map, takeUntil } from 'rxjs/operators';
import { DateTimeFormat, EMPTY, SUCCESS_CODE, VisaIcon, WorkFlowAction } from 'src/app/core/constants';
import { PaginationResponse, ResponseError } from 'src/app/core/models/pagination-response.model';
import { StatusCode } from 'src/app/core/models/status.model';
import { UserRole } from 'src/app/core/models/user.model';
import { EventGroupByTemplateDialogConfig, EventGroupTemplate, EventTemplate } from 'src/app/pages/event-group-template/event-group-template.model';
import { AuthorizationService } from 'src/app/services/authorization.service';
import { EventGroupTemplateService } from 'src/app/services/event-group-template.service';
import { CustomFormGroup, FormBuilder, FormService } from 'src/app/services/form-service/form.service';
import { GarbageCollectorService } from 'src/app/services/garbage-collector.service';
import { EventGroupService } from 'src/app/services/program/event-group/event-group.service';
import { EventService } from 'src/app/services/program/event/event.service';
import { ProgramService } from 'src/app/services/program/program.service';
import { ToggleAlertService } from 'src/app/services/toggle-alert/toggle-alert.service';
import { FunctionsService } from 'src/app/services/util/functions.service';
import { Utils } from 'src/app/services/utils';
import { CommentsModalComponent } from 'src/app/shared/comments-modal/comments-modal.component';
import { EntityType } from 'src/app/shared/comments-modal/comments-modal.model';
import { EventGroup, EventGroupStep, EventGroupVersion } from '../../../event-group.model';
import { CriteriaValues, CustomFieldValueList, Event, EventAction, EventCondition } from '../../../event.model';
import { DialogMode } from '../../../program.model';
import { ConfirmDialogComponent } from '../create-edit-event-group/confirm-dialog/confirm-dialog.component';
import { EventGroupSummaryComponent } from '../create-edit-event-group/event-group-summary/event-group-summary.component';
import { EventGroupDetailsComponent } from './event-group-details/event-group-details.component';
import { DialogService } from 'src/app/services/dialog/dialog.service';

@Component({
  selector: 'app-create-edit-event-group-by-template',
  templateUrl: './create-edit-event-group-by-template.component.html',
  styleUrls: ['./create-edit-event-group-by-template.component.scss']
})
export class CreateEditEventGroupByTemplateComponent implements OnInit, OnDestroy {
  @ViewChild(EventGroupDetailsComponent)
  eventGroupDetailComponent!: EventGroupDetailsComponent;


  @ViewChild(EventGroupSummaryComponent)
  eventGroupSummaryComponent!: EventGroupSummaryComponent;



  private destroy$ = new Subject<void>();

  versionSelector: UntypedFormControl = new UntypedFormControl();


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

  selectedEventTemplate!: EventTemplate;

  eventGroupVersions!: EventGroupVersion[];


  eventGroupForm: CustomFormGroup<EventGroup> = this.formBuilder
    .group(
      {
        ...new EventGroup(),
        eventStageList: this.formBuilder.array([])
      }
    );

  initializeForm: boolean = false;
  expandEvents: boolean = false;
  showLoader: boolean = false;
  initTab: boolean = false;
  showEditButton: boolean = false;

  selectedTabIndex: number = -1;
  expandedEventIndex: number = -1;
  selectedWorkflowVersion!: EventGroupVersion;
  dialogConfig!: EventGroupByTemplateDialogConfig;

  currentUserId!: string;

  userRole!: UserRole;

  confirmDialogRef!: MatDialogRef<ConfirmDialogComponent>;

  tabs: string[] = [];

  get selectedWorkflowVersionNumber(): number {
    return Number(this.versionSelector?.value || EMPTY);
  }

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
    return (this.mode === DialogMode.VIEW);
  }

  get showCloseButton(): boolean {
    return this.selectedTabIndex !== this.tabs.indexOf(EventGroupStep.DETAILS) || !this.editable || this.editableForApproveVersion;
  }

  get disabledApproveOrReject(): boolean {
    return (
      (this.mode === DialogMode.CREATE) ||
      (this.eventGroup?.modifiedUserId === this.currentUserId) ||
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
    return (
      (this.eventGroup?.eventGroupStatusCode !== StatusCode.PENDING_REVIEW) &&
      (this.eventGroup?.eventGroupStatusCode !== StatusCode.PENDING_DEACTIVATION_REVIEW) &&
      this.mode !== DialogMode.VIEW
    );
  }

  get isPublishedVersion(): boolean {
    return !!this.selectedWorkflowVersion?.publishedVersion;
  }

  get eventList() {
    return this.eventGroupForm.controls.eventStageList?.value || [];
  }

  get editableForApproveVersion(): boolean {
    return (this.selectedWorkflowVersion?.eventGroupStatusCode === StatusCode.APPROVED) && this.showEditButton;
  }

  readonly viewName = 'create-edit-event-group-by-template';

  getTabId: Function = this.functionService.getTabId;
  getTabLabelledById: Function = this.functionService.getTabLabelledById;

  afterCallBack = (submitRequest: boolean) => {
    this.confirmDialogRef.close();

    if (submitRequest) {
      this.reload();
    }
  };


  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private formService: FormService,
    private programService: ProgramService,
    private eventGroupService: EventGroupService,
    private toggleAlertService: ToggleAlertService,
    private authorizationService: AuthorizationService,
    private eventService: EventService,
    private eventGroupTemplateService: EventGroupTemplateService,
    private functionService: FunctionsService,
    private viewRef: ViewContainerRef,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<CreateEditEventGroupByTemplateComponent>,
    private dialogService: DialogService,
    @Inject(MAT_DIALOG_DATA) private dialogConfiguration: EventGroupByTemplateDialogConfig
  ) {
    this.userRole = this.authorizationService.getUserRole();
    this.currentUserId = this.authorizationService.getUserId();
    this.dialogConfig = this.dialogConfiguration;

    this.dialogService.setDialogEventListeners(
      this.dialogRef,
      this.close.bind(this)
    ).pipe(takeUntil(this.destroy$)).subscribe();
  }

  private prepareEventGroupFromTemplate(template: EventGroupTemplate): EventGroup {
    const eventGroup = new EventGroup();

    eventGroup.programStageId = this.dialogConfig.programStageId;

    eventGroup.communityCode = template.communityCode;
    eventGroup.eventGroupTemplateId = template.eventGroupTemplateId;
    eventGroup.eventGroupName = template.eventGroupName;
    eventGroup.eventGroupType = template.eventGroupType;
    eventGroup.eventStageList = template.eventTemplateList;

    eventGroup.eventStageList = eventGroup.eventStageList.map(event =>
      this.eventService.parseResponse(new PaginationResponse(event)).data
    )

    return eventGroup;
  }

  private initEventGroupForm() {
    this.showLoader = true;
    this.initializeForm = false;

    this.eventGroupTemplateService.getEventGroupTemplate(this.dialogConfig.eventGroupTemplateId!, true)
      .pipe(takeUntil(this.destroy$)).subscribe(response => {
        this.showLoader = false;
        if (Utils.isNull(response.errors)) {
          const eventGroupTemplate: EventGroupTemplate = response.data;

          this.mapEventTemplateResponse(
            this.prepareEventGroupFromTemplate(eventGroupTemplate)
          );
          this.moveToPreviouslySelectedTab();

          this.initializeForm = true;

        } else {
          this.toggleAlertService.showResponseErrors(response.errors);
        }
      });
  }

  private init() {
    this.mode = this.dialogConfig.dialogMode;

    if (this.mode === DialogMode.CREATE) {
      this.updateTabForSelectedVersion(false);
      this.initEventGroupForm();
    } else {
      this.getEventGroupVersions();
    }
  }

  private moveToPreviouslySelectedTab() {
    const selectTab = this.dialogConfig.selectTab;

    if (selectTab) {
      this.setCurrentTab(this.tabs.indexOf(selectTab));
    }
  }

  private mapEvents(response: EventGroup) {
    this.eventGroupForm?.controls?.eventStageList.patchValue([]);

    const templateEventListArray: UntypedFormArray = this.eventGroupForm?.get('eventStageList') as UntypedFormArray;
    templateEventListArray.controls = [];

    response.eventStageList.map(tEvent => {
      const eventFormGroup = this.formBuilder.group(
        {
          ...new EventTemplate(),
          eventDetails: this.formBuilder.array([]),
          eventActions: this.formBuilder.array([])
        }
      );

      tEvent.eventStatus = this.mode === DialogMode.CREATE ? StatusCode.DRAFT : tEvent.eventStatus;

      eventFormGroup.patchValue(tEvent);

      const eventDetailsFormArray = eventFormGroup.get("eventDetails") as UntypedFormArray;
      const eventActionsFormArray = eventFormGroup.get("eventActions") as UntypedFormArray;

      if (Utils.isNotNull(tEvent.eventDetails)) {
        tEvent.eventDetails.map(ed => {

          const eventDetailFormGroup = this.formBuilder.group({
            ...new EventCondition(Utils.generateId()),
            criteriaValues: this.formBuilder.group(new CriteriaValues())
          });

          eventDetailFormGroup.patchValue(ed);
          eventDetailsFormArray.push(eventDetailFormGroup);
        });
      }

      if (Utils.isNotNull(tEvent.eventActions)) {
        tEvent.eventActions.map(action => {

          const eventActionFormGroup = this.formBuilder.group({
            ...new EventAction(),
            customFieldValueList: this.formBuilder.array([])
          });

          eventActionFormGroup.patchValue(action);

          const customListFormArray = eventActionFormGroup.get("customFieldValueList") as UntypedFormArray;

          customListFormArray.controls = [];
          if (Utils.isNotNull(action.customFieldValueList)) {
            action.customFieldValueList?.forEach(item => {
              const customFormGroup = this.formBuilder.group(new CustomFieldValueList());
              customFormGroup.patchValue(item);

              customListFormArray.push(customFormGroup);
            });
          }
          eventActionsFormArray.push(eventActionFormGroup);
        });
      }

      templateEventListArray.push(eventFormGroup);
    });
  }

  private mapEventTemplateResponse(response: EventGroup) {
    this.eventGroupForm.patchValue(response);
    this.eventGroupForm.controls.eventGroupTemplateId.patchValue(response.eventGroupTemplateId || this.dialogConfig.eventGroupTemplateId);
    this.eventGroupForm.controls.communityCode.patchValue(this.programService.communityCode);

    this.formService.clearFormControlValidators(this.eventGroupForm);
    this.eventGroupForm.markAsPristine();

    this.mapEvents(response);

    this.showEditButton = response.eventGroupStatusCode === StatusCode.APPROVED;
    this.initializeForm = true;
  }

  private updateTabForSelectedVersion(showSummaryView: boolean) {
    this.initTab = false;
    const isHistoryTabSelected = (this.selectedTabIndex > -1) && (this.selectedTabIndex === this.tabs.indexOf(EventGroupStep.HISTORY));

    if (showSummaryView) {
      this.tabs = [
        EventGroupStep.SUMMARY,
        EventGroupStep.HISTORY
      ];

      this.setCurrentTab(
        isHistoryTabSelected ?
          this.tabs.indexOf(EventGroupStep.HISTORY)
          : this.tabs.indexOf(EventGroupStep.SUMMARY)
      );

    } else {
      this.tabs = [
        EventGroupStep.SUMMARY,
        EventGroupStep.DETAILS
      ];

      if (this.mode !== DialogMode.CREATE) {
        this.tabs.push(EventGroupStep.HISTORY);
      }

      this.setCurrentTab(
        isHistoryTabSelected ?
          this.tabs.indexOf(EventGroupStep.HISTORY)
          : this.tabs.indexOf(EventGroupStep.DETAILS)
      );
      this.moveToPreviouslySelectedTab();
    }

    setTimeout(() => this.initTab = true, 0);
  }


  private getEventGroup(isPublishedVersion: boolean, workflowVersionNumber?: number) {
    this.showLoader = true;
    this.initializeForm = false;

    return this.eventGroupService.getEventGroup(
      this.dialogConfig.programStageId,
      this.dialogConfig.eventGroupId,
      isPublishedVersion,
      workflowVersionNumber
    ).pipe(
      map(
        response => {
          this.showLoader = false;

          if ((response.statusCode === SUCCESS_CODE) && Utils.isNull(response.errors)) {
            this.mapEventTemplateResponse(response.data);
          } else {
            this.toggleAlertService.showResponseErrors(response.errors);
          }

          return response;
        }
      ));
  }

  private performVersionSelection(workflowVersionNumber: number) {
    if (workflowVersionNumber > 0) {
      const validVersion: EventGroupVersion = this.eventGroupVersions.find(v => v.workflowVersionNumber === workflowVersionNumber)!;

      this.versionSelector.patchValue(validVersion?.workflowVersionNumber);
    }

    this.dialogConfig.workflowVersionNumber = undefined;
  }

  private getEventGroupVersions(reload: boolean = false) {
    this.eventGroupVersions && (this.eventGroupVersions.length = 0);

    this.eventGroupService.getEventGroupVersions(
      this.dialogConfig.eventGroupId,
      this.programService.communityCode
    ).subscribe(response => {
      if ((response.statusCode === SUCCESS_CODE) && Utils.isNull(response.errors)) {
        this.eventGroupVersions = response.data;
      } else {
        this.toggleAlertService.showResponseErrors(response.errors);
      }

      let workflowVersionNumber: number;

      if (reload) {
        workflowVersionNumber = this.eventGroupVersions[0].workflowVersionNumber;
      } else if (!this.dialogConfig?.workflowVersionNumber) {
        workflowVersionNumber = this.eventGroupVersions.find(ver => {
          if (this.dialogConfig.isPublished && ver.publishedVersion) {
            return ver;
          }
          if (!this.dialogConfig.isPublished && ver.hasDraft) {
            return ver;
          }
          return undefined;
        })?.workflowVersionNumber!;
      }

      this.performVersionSelection(this.dialogConfig?.workflowVersionNumber || workflowVersionNumber!);
    });

  }

  private reload(eventGroup?: EventGroup) {

    if (this.mode === DialogMode.CREATE) {
      this.mode = DialogMode.EDIT;
      this.dialogConfig.eventGroupId = this.dialogConfig.eventGroupId || eventGroup?.eventGroupId!;
      this.dialogConfig.dialogMode = this.mode;
    }

    this.versionSelector.reset();

    this.getEventGroupVersions(true);
  }

  private createOrUpdateEventGroup(isSaveAndExit: boolean) {
    const isValid = this.eventGroupDetailComponent.validate();

    if (isValid) {
      this.showLoader = true;

      const callback = this.mode === DialogMode.CREATE
        ? this.eventGroupService.createEventGroupByTemplate(this.eventGroup)
        : this.eventGroupService.updateEventGroupByTemplate(this.eventGroup);

      callback.pipe(takeUntil(this.destroy$)).subscribe({
        next: response => {
          this.showLoader = false;

          if ((response.statusCode === SUCCESS_CODE) && Utils.isNull(response.errors)) {
            this.eventGroupService.emitReloadEventGroup(true);

            this.setAlertMessage();

            if (isSaveAndExit) {

              this.dialogRef.close();
            } else {
              this.reload(response.data);
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

  private setErrorMessages(responseErrors: ResponseError[]) {
    this.toggleAlertService.showResponseErrors(responseErrors);
  }

  private setAlertMessage() {
    this.toggleAlertService.showSuccessMessage(
      this.mode === DialogMode.CREATE
        ? `Event Group added successfully.`
        : `Event Group updated successfully.`
    );
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

            if (afterSubmitCallback) {
              afterSubmitCallback(true);
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


  private openConfirmDialog(workflow: WorkFlowAction, submitCallback: Function) {
    let title = EMPTY;

    if (workflow === WorkFlowAction.REJECT) {
      title = 'Rejection Comment';
    }
    if (workflow === WorkFlowAction.REJECT_DEACTIVATION) {
      title = 'Reason for Deactivation Rejection';
    }
    if (
      (workflow === WorkFlowAction.SUBMIT_FOR_DEACTIVATE) ||
      (workflow === WorkFlowAction.DEACTIVATE) ||
      (workflow === WorkFlowAction.APPROVE_DEACTIVATION)
    ) {
      title = 'Reason for Deactivation'
    }


    this.confirmDialogRef = this.dialog.open(
      ConfirmDialogComponent,
      {
        hasBackdrop: true, disableClose: true,
        ariaLabel: 'comfirm-dialog',
        data: {
          dialogTitle: title,
          submitCallback: submitCallback,
          closeCallback: () => { this.confirmDialogRef.close() }
        },
      });
  }

  ngOnInit(): void {
    this.eventGroupService.emitReloadEventGroup(false);

    this.versionSelector.valueChanges.pipe(
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(value => {
      if (!!value) {
        this.handleVersionChange(value);
      }
    });

    this.init();
  }

  setCurrentTab(index: number = this.tabs.indexOf(EventGroupStep.DETAILS)) {
    this.selectedTabIndex = index;
  }

  handleWorkflowChange(workFlowAction: WorkFlowAction) {
    this.showEditButton = false;

    if (WorkFlowAction.SUBMIT_FOR_APPROVAL === workFlowAction) {
      this.performStatusTransition(this.eventGroupService.submitEventGroup(this.eventGroup), () => this.reload());
    } else if (WorkFlowAction.APPROVE === workFlowAction) {
      this.performStatusTransition(
        this.eventGroupService.approveEventGroup(this.eventGroup),
        () => {
          this.showEditButton = true;
          this.reload();
        });
    } else if (WorkFlowAction.PUBLISH === workFlowAction) {
      this.performStatusTransition(this.eventGroupService.publishEventGroup(this.eventGroup), () => this.reload());
    } else if (WorkFlowAction.REJECT === workFlowAction) {
      this.openConfirmDialog(
        workFlowAction,
        (comment: string) =>
          this.performStatusTransition(
            this.eventGroupService.rejectEventGroup(
              this.eventGroup,
              comment
            ),
            this.afterCallBack
          )
      );

    } else if (WorkFlowAction.DISCARD === workFlowAction) {
      const params = {
        programStageId: this.dialogConfig.programStageId,
        communityCode: this.eventGroup.communityCode
      };

      this.eventGroupService.openEventGroupDeleteOrDiscardConfirmDialog(this.eventGroup.eventGroupId, params,
        () => {
          this.reload();
        },
        false);
    } else if (WorkFlowAction.DELETE === workFlowAction) {
      const params = {
        programStageId: this.dialogConfig.programStageId,
        communityCode: this.eventGroup.communityCode
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
        )
      );
    }
  }

  handleEventWorkflowChange(selectedEventAndAction: { event: Event, action: WorkFlowAction }) {
    const event = selectedEventAndAction.event;
  }


  handleVersionChange(workflowVersionNumber: any, showEditView: boolean = false) {
    const version = this.eventGroupVersions.find(ver => ver.workflowVersionNumber === Number(workflowVersionNumber));
    this.selectedWorkflowVersion = version!;


    this.getEventGroup(!!version?.publishedVersion, version?.workflowVersionNumber!)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        res => {
          const eventGroup = res.data;

          if (showEditView) {
            this.updateTabForSelectedVersion(false);
          } else {
            this.updateTabForSelectedVersion(
              ((eventGroup.eventGroupStatusCode === StatusCode.PENDING_REVIEW) || (eventGroup.eventGroupStatusCode === StatusCode.PENDING_DEACTIVATION_REVIEW)) ||
              (
                (
                  this.selectedWorkflowVersion.publishedVersion ||
                  eventGroup.archived
                ) && !this.selectedWorkflowVersion.hasDraft
              )
            );
          }
        }
      );
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
      const draftVersion = this.eventGroupVersions.find(version => version.hasDraft === true);

      if (!!draftVersion) {
        this.performVersionSelection(draftVersion?.workflowVersionNumber!);
      } else {

        this.handleVersionChange(this.eventGroupVersions[0].workflowVersionNumber, true);
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

  getDisabledStartDateTimeMessage(): string | null {
    return this.programService.getDisabledStartDateTimeMessage(this.eventGroup, this.mode);
  }

  getDisabledEndDateTimeMessage(): string | null {
    return this.programService.getDisabledEndDateTimeMessage(this.eventGroup, this.mode);
  }

  openCommentDialog() {
    const eventGroupId = this.dialogConfig.eventGroupId!;
    const params: any = {
      communityCode: this.route.snapshot.queryParams['client'],
      workflowVersion: this.eventGroup.workflowVersionNumber
    }

    const callback = this.eventGroupService.getEventGroupMessages(eventGroupId, params);


    const onSaveCallback = (comment: string) => {

      const params: any = {
        communityCode: this.route.snapshot.queryParams['client'],
        entityId: this.dialogConfig.eventGroupId,
        parentEntityId: 0,
        workflowVersionNumber: this.selectedWorkflowVersion.workflowVersionNumber,
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
      data: {
        callback: callback,
        onSaveCallback: onSaveCallback,
        onCloseCallback: onCloseCallback,
        entityType: EntityType.EVENT_GROUP_TEMPLATE,
        dialogTitle: this.eventGroup.eventGroupName,
        saveComments: !this.eventGroup.archived
      }
    });
  }

  initDataEmitter(init: boolean) {
    const scrollViewId = this.dialogConfig.viewId!;

    if (init) {
      setTimeout(
        () => {
          this.functionService.expandAccordionItems(
            true,
            (this.selectedTabIndex === this.tabs.indexOf(EventGroupStep.DETAILS))
              ?
              this.eventGroupDetailComponent?.accordions
              : this.eventGroupSummaryComponent?.accordions
          );



          this.functionService.scrollToView(scrollViewId);
        },
        4000
      );
    }
  }


  ngOnDestroy(): void {
    this.eventGroupService.emitReloadEventGroup(false);

    this.destroy$.next();
    this.destroy$.complete();

    GarbageCollectorService.clearDetachedDOMElements(
      this,
      this.viewRef
    )
  }
}