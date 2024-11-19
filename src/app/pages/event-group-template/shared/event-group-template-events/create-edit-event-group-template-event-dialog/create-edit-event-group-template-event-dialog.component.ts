import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ButtonColor, ButtonIconType, TabsOrientation } from '@visa/vds-angular';
import { DateTimeFormat, SUCCESS_CODE } from 'src/app/core/constants';
import { ResponseError } from 'src/app/core/models/pagination-response.model';
import { StatusCode } from 'src/app/core/models/status.model';
import { EventStep } from 'src/app/pages/programs/event.model';
import { DialogMode } from 'src/app/pages/programs/program.model';
import { CustomFormGroup, FormBuilder, FormService } from 'src/app/services/form-service/form.service';
import { NavStatusService } from 'src/app/services/nav-status/nav-status.service';
import { EventActionService } from 'src/app/services/program/event-action/event-action.service';
import { EventService } from 'src/app/services/program/event/event.service';
import { ToggleAlertService } from 'src/app/services/toggle-alert/toggle-alert.service';
import { DateUtils } from 'src/app/services/util/dateUtils';
import { FunctionsService } from 'src/app/services/util/functions.service';
import { Utils } from 'src/app/services/utils';
import { EventGroupTemplate, EventTemplate } from '../../../event-group-template.model';
import { EventGroupTemplateEventDetailsComponent } from './event-group-template-event-details/event-group-template-event-details.component';
import { EventGroupTemplateEventRelationshipsComponent } from './event-group-template-event-relationships/event-group-template-event-relationships.component';
import { DialogService } from 'src/app/services/dialog/dialog.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-create-edit-event-group-template-event-dialog',
  templateUrl: './create-edit-event-group-template-event-dialog.component.html',
  styleUrls: ['./create-edit-event-group-template-event-dialog.component.scss']
})
export class CreateEditEventGroupTemplateEventDialogComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  readonly viewName = "create-edit-event-group-template-event-dialog";

  @ViewChild(EventGroupTemplateEventRelationshipsComponent)
  eventGroupTemplateEventRelationshipsComponent!: EventGroupTemplateEventRelationshipsComponent;

  @ViewChild(EventGroupTemplateEventDetailsComponent)
  eventGroupTemplateEventDetailsComponent!: EventGroupTemplateEventDetailsComponent;

  ButtonColor = ButtonColor;
  DialogMode = DialogMode;
  TabsOrientation = TabsOrientation;
  ButtonIconType = ButtonIconType;
  EventStep = EventStep;

  eventTemplateForm: CustomFormGroup<EventTemplate> = this.formBuilder.group(new EventTemplate());


  mode: DialogMode = DialogMode.CREATE;

  eventDetails!: EventTemplate | null;
  eventGroupTemplate!: EventGroupTemplate;


  initializeForm: boolean = false;
  showLoader: boolean = false;
  initTab: boolean = true;
  reloadEventGroup: boolean = false;

  selectedTabIndex = 0;

  returnCallback!: Function;

  tabs: any[] = [];

  getTabId: Function = this.functionService.getTabId;
  getTabLabelledById: Function = this.functionService.getTabLabelledById;

  get eventTemplate(): EventTemplate {
    return this.eventTemplateForm.getRawValue() as EventTemplate;
  }

  get disabled(): boolean {
    return (this.mode === DialogMode.VIEW) || (this.eventTemplate.eventStatus === StatusCode.PENDING_REVIEW);
  }

  get showCloseButton(): boolean {
    return this.selectedTabIndex === this.tabs.indexOf(EventStep.EVENT_CONDITIONS) ||
      this.selectedTabIndex === this.tabs.indexOf(EventStep.EVENT_ACTION);
  }

  get title(): string {
    let title = 'Event Template';
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
    private formBuilder: FormBuilder,
    private formService: FormService,
    private eventService: EventService,
    private toggleAlertService: ToggleAlertService,
    private eventActionService: EventActionService,
    private navStatusService: NavStatusService,
    private functionService: FunctionsService,
    private dialogService: DialogService,
    private dialogRef: MatDialogRef<CreateEditEventGroupTemplateEventDialogComponent>
  ) {
    this.dialogService.setDialogEventListeners(
      this.dialogRef,
      () => { this.closeDialog(); }
    ).pipe(takeUntil(this.destroy$)).subscribe();
   }

  private init() {
    this.initUiRelatedData();
  }

  private initTabs() {
    this.initTab = false;

    if (this.mode !== DialogMode.CREATE) {
      this.tabs = [
        EventStep.EVENT_DETAILS,
        EventStep.EVENT_CONDITIONS,
        EventStep.EVENT_RELATIONSHIPS,
        EventStep.EVENT_ACTION
      ];
    } else {

      this.tabs = [
        EventStep.EVENT_DETAILS,
        EventStep.EVENT_CONDITIONS,
        EventStep.EVENT_ACTION
      ];
    }

    setTimeout(
      () => {
        this.initTab = true;
      },
      0
    );

  }

  private moveToPreviouslySelectedTab() {
    const eventActionDialogConfig = this.eventActionService.getEventActionDialogConfigData();

    if (eventActionDialogConfig?.eventDialogSelectedTab) {
      this.setCurrentTab(eventActionDialogConfig?.eventDialogSelectedTab);
    }
  }

  private initUiRelatedData() {
    this.initializeForm = false;

    const data = this.eventService.getEventDialogConfigData();

    if (data) {
      this.setDialogData(data);

      this.initTabs();
      this.moveToPreviouslySelectedTab();

      if (this.mode !== DialogMode.CREATE) {
        this.getTemplateEvent();
      } else {
        this.initEventForm();
      }

    }
  }

  private setDialogData(data: any) {
    this.mode = data?.dialogMode;
    this.eventDetails = data?.event;

    const eventGroupDialogConfigData = data?.eventGroupDialogConfigData;

    if (eventGroupDialogConfigData) {
      this.eventGroupTemplate = eventGroupDialogConfigData?.eventGroupTemplate;
    }
  }

  private initEventForm() {
    if (this.eventGroupTemplate) {
      this.eventTemplateForm
        .get('communityCode')
        ?.patchValue(this.eventGroupTemplate.communityCode);
      this.eventTemplateForm
        .get('eventGroupTemplateId')
        ?.patchValue(this.eventGroupTemplate.eventGroupTemplateId);

      this.eventTemplateForm
        .get('eventStartDate')
        ?.patchValue(this.eventGroupTemplate.eventGroupStartDate);
      this.eventTemplateForm
        .get('eventEndDate')
        ?.patchValue(this.eventGroupTemplate.eventGroupEndDate);

      this.eventTemplateForm
        .controls.formattedStartDate
        ?.patchValue(
          DateUtils.formatDateTime(this.eventGroupTemplate.eventGroupStartDate, DateTimeFormat.MOMENT_YYYY_MM_DD),
          { onlySelf: true, emitEvent: false }
        );

      this.eventTemplateForm
        .controls.formattedEndDate
        ?.patchValue(
          DateUtils.formatDateTime(this.eventGroupTemplate.eventGroupEndDate, DateTimeFormat.MOMENT_YYYY_MM_DD),
          { onlySelf: true, emitEvent: false }
        );

      this.eventTemplateForm.get('startTime')?.patchValue(this.eventGroupTemplate.startTime);
      this.eventTemplateForm.get('endTime')?.patchValue(this.eventGroupTemplate.endTime);

      this.initializeForm = true;
    }
  }

  private getTemplateEvent() {
    if (this.eventDetails) {
      this.eventService
        .getTemplateEvent(this.eventDetails.eventTemplateId)
        .subscribe(response => {
          if ((response.statusCode === SUCCESS_CODE) && Utils.isNull(response.errors)) {
            this.mapEvent(response.data);
          }
        });
    }
  }

  private mapEvent(eventTemplate: EventTemplate) {
    this.initializeForm = false;

    this.eventTemplateForm.patchValue(eventTemplate);


    this.eventTemplateForm
      .controls.formattedStartDate
      ?.patchValue(
        DateUtils.formatDateTime(this.eventGroupTemplate.eventGroupStartDate, DateTimeFormat.MOMENT_YYYY_MM_DD),
        { onlySelf: true, emitEvent: false }
      );

    this.eventTemplateForm
      .controls.formattedEndDate
      ?.patchValue(
        DateUtils.formatDateTime(this.eventGroupTemplate.eventGroupEndDate, DateTimeFormat.MOMENT_YYYY_MM_DD),
        { onlySelf: true, emitEvent: false }
      );


    this.formService.clearFormControlValidators(this.eventTemplateForm);

    this.eventTemplateForm.markAsPristine();

    this.initializeForm = true;
  }

  private setErrorMessages(responseErrors: ResponseError[]) {
    this.toggleAlertService.showResponseErrors(responseErrors);

    this.eventService.updateErrorMessages(responseErrors, this.eventTemplateForm);
  }

  private setAlertMessage() {
    this.toggleAlertService.showSuccessMessage(`Event ${this.mode === DialogMode.CREATE ? 'added' : 'updated'} successfully.`)
  }

  private setCurrentTab(eventStep: EventStep) {
    this.selectedTabIndex = this.tabs.indexOf(eventStep);
  }

  private resetDialogConfig(response: EventTemplate) {
    this.eventService.setEventDialogConfigData(
      DialogMode.EDIT,
      response,
      false,
      {
        eventGroupTemplate: this.eventGroupTemplate
      },
      this.tabs[this.selectedTabIndex]
    );
  }

  private createOrUpdateEvent(isSaveAndExit: boolean = false) {
    const isValid = this.eventGroupTemplateEventDetailsComponent.validate();

    if (isValid) {
      let callback;

      const payload = this.eventTemplateForm.getRawValue();

      if (this.mode === DialogMode.CREATE) {
        callback = this.eventService.createEventTemplate(payload);
      } else {
        callback = this.eventService.updateEventTemplate(this.eventTemplate.eventTemplateId, payload);
      }

      this.showLoader = true;

      callback.subscribe({
        next: response => {
          this.showLoader = false;

          if ((response.statusCode === SUCCESS_CODE) && Utils.isNull(response.errors)) {
            this.eventService.emitReloadEvent(true);

            this.setAlertMessage();

            if (isSaveAndExit) {
              this.closeDialog();
            } else {
              this.mode = DialogMode.EDIT;

              this.resetDialogConfig(response?.data);

              this.init();
            }
          } else {
            this.setErrorMessages(response.errors);
          }
        },
        error: err => {
          this.showLoader = false;
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

  save() {
    if (this.selectedTabIndex === this.tabs.indexOf(EventStep.EVENT_RELATIONSHIPS)) {
      this.eventGroupTemplateEventRelationshipsComponent?.relationshipComponent?.setEventDependency();
    } else {
      this.createOrUpdateEvent();
    }
  }

  saveAndExit() {
    if (this.selectedTabIndex === this.tabs.indexOf(EventStep.EVENT_RELATIONSHIPS)) {
      this.eventGroupTemplateEventRelationshipsComponent?.relationshipComponent?.setEventDependency();
    } else {
      this.createOrUpdateEvent(true);
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }

  onTabChange(event: any) {
    this.navStatusService.togglePanel(false);
  }

  hideTab(step: EventStep): boolean {
    const selectedIndex = this.tabs.indexOf(step);

    return this.selectedTabIndex !== selectedIndex;
  }

  handleEventConditionSubmitRequest(eventTemplate: EventTemplate | null = null) {
    this.resetDialogConfig(eventTemplate!);

    this.setAlertMessage();
    this.initUiRelatedData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.eventService.emitReloadEvent(false);
  }
}
