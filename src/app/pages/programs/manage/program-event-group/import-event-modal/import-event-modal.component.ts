import { AfterViewInit, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ButtonColor, CALENDAR_PLACEMENT } from '@visa/vds-angular';
import * as moment from 'moment';
import { Subject, takeUntil } from 'rxjs';
import { DateTimeFormat, EMPTY, SUCCESS_CODE } from 'src/app/core/constants';
import { ResponseError } from 'src/app/core/models/pagination-response.model';
import { FormService } from 'src/app/services/form-service/form.service';
import { HttpService } from 'src/app/services/http/http.service';
import { EventGroupService } from 'src/app/services/program/event-group/event-group.service';
import { EventService } from 'src/app/services/program/event/event.service';
import { ProgramService } from 'src/app/services/program/program.service';
import { ToggleAlertService } from 'src/app/services/toggle-alert/toggle-alert.service';
import { DateUtils } from 'src/app/services/util/dateUtils';
import { Utils } from 'src/app/services/utils';
import { EventGroupStep } from '../../../event-group.model';
import { CreateEditEventGroupComponent } from '../create-edit-event-group/create-edit-event-group.component';
import { CreateEditEventComponent } from '../create-edit-event/create-edit-event.component';
import { DialogService } from 'src/app/services/dialog/dialog.service';

@Component({
  selector: 'app-import-event-modal',
  templateUrl: './import-event-modal.component.html',
  styleUrls: ['./import-event-modal.component.scss']
})
export class ImportEventModalComponent implements OnInit, AfterViewInit, OnDestroy {
  private destroy$ = new Subject<void>();

  buttonColor = ButtonColor;
  CALENDAR_PLACEMENT = CALENDAR_PLACEMENT;

  get form(): UntypedFormGroup {
    return this.importType == 'event-group' ? this.eventGroupForm : this.eventForm
  }

  constructor(
    private formBuilder: UntypedFormBuilder,
    private http: HttpService,
    private router: Router,
    private eventGroupService: EventGroupService,
    private eventService: EventService,
    private alertService: ToggleAlertService,
    private formService: FormService,
    private dialog: MatDialog,
    private dialogService: DialogService,
    private programService: ProgramService,
    private dialogRef: MatDialogRef<ImportEventModalComponent>,
    @Inject(MAT_DIALOG_DATA) private dialogConfig: any
  ) {
    this.dialogService.setDialogEventListeners(
      this.dialogRef,
      () => { this.close(); }
    ).pipe(takeUntil(this.destroy$)).subscribe();
  }

  eventGroupForm = this.formBuilder.group({
    eventGroupName: [EMPTY],
    eventGroupId: [EMPTY, Validators.required],
    communityCode: [EMPTY, Validators.required],
    programStageId: [EMPTY, Validators.required],
    eventGroupStartDate: [undefined],
    eventGroupEndDate: [undefined]
  });

  eventForm = this.formBuilder.group({
    eventName: [EMPTY],
    communityCode: [EMPTY, Validators.required],
    eventStageId: [EMPTY, Validators.required],
    eventStartDate: [undefined],
    eventEndDate: [undefined],
    eventDescription: [EMPTY],
    uiStructurePos: [EMPTY],
    comment: [EMPTY],
    eventGroupId: [EMPTY, Validators.required]
  });

  importType = EMPTY;
  name = EMPTY;
  sDate = EMPTY;
  eDate = EMPTY;
  startTime = EMPTY;
  endTime = EMPTY;
  stageId = 0;
  timeZone = DateUtils.getTimeZone();
  afterDialogData: any;
  eventGroupDetails: any;
  openParentDialog: boolean = true;
  errorMessages: any = {};

  ngOnInit(): void {
    this.eventGroupService.emitReloadEventGroup(false);
    this.eventService.emitReloadEvent(false);

    this.stageId = parseInt(
      this.router.url
        .split('?')
        .shift()
        ?.split('/')
        .pop()!
    );

    this.openParentDialog = this.dialogConfig?.openParentDialog;

    this.importType = this.dialogConfig.type;
    const data = this.dialogConfig.data;
    this.afterDialogData = this.dialogConfig.parentDialogData;

    if (this.importType == 'event-group') {
      this.name = 'eventGroupName';
      this.sDate = 'eventGroupStartDate';
      this.eDate = 'eventGroupEndDate';

      data.eventGroupStartDate = this.convertTimeZone(
        'local',
        data.eventGroupStartDate
      );

      data.eventGroupEndDate = this.convertTimeZone(
        'local',
        data.eventGroupEndDate
      );

      this.eventGroupForm.patchValue({
        ...data,
        eventGroupStartDate: undefined,
        eventGroupEndDate: undefined,
        programStageId: this.stageId
      });

      this.startTime = '00:00';
      this.endTime = '23:59';
    } else {
      this.name = 'eventName';
      this.sDate = 'eventStartDate';
      this.eDate = 'eventEndDate';

      this.eventGroupDetails = this.dialogConfig.eventGroupDetails;

      data.eventStartDate = this.convertTimeZone(
        'local',
        this.eventGroupDetails.eventGroupStartDate
      );
      data.eventEndDate = this.convertTimeZone(
        'local',
        this.eventGroupDetails.eventGroupEndDate
      );

      this.eventForm.patchValue({
        ...data,
        eventStartDate: new Date(data.eventStartDate),
        eventEndDate: new Date(data.eventEndDate),
        eventGroupId: this.eventGroupDetails.eventGroupId
      });

      this.startTime = data.eventStartDate
        .split(' ')
        .pop()
        .slice(0, 5);
      this.endTime = data.eventEndDate
        .split(' ')
        .pop()
        .slice(0, 5);
    }
  }

  ngAfterViewInit(): void {
    this.formService.clearFormControlValidators(this.form);
  }

  setTime(e: Event, type: 'sTime' | 'eTime') {
    const value = (e.target as HTMLInputElement).value;

    type == 'sTime' ? (this.startTime = value) : (this.endTime = value);
  }

  getFormData(key: 'sDate' | 'eDate') {
    const keyAssign: any = {
      'event-group': {
        sDate: 'eventGroupStartDate',
        eDate: 'eventGroupEndDate'
      },
      event: { sDate: 'eventStartDate', eDate: 'eventEndDate' }
    };

    return this.importType == 'event-group'
      ? this.eventGroupForm.get(keyAssign[this.importType][key])!
      : this.eventForm.get(keyAssign[this.importType][key])!;
  }

  convertTimeZone(type: 'local' | 'GMT', date: string, time?: string) {
    if (type == 'local') {
      return DateUtils.formatDateTime(
        moment.utc(date, DateTimeFormat.MOMENT_YYYY_MM_DD_TIME).local()
        , DateTimeFormat.MOMENT_YYYY_MM_DD_TIME
      );
    } else {
      return DateUtils.formatDateTime(
        moment(` ${DateUtils.formatDateTime(date, DateTimeFormat.MOMENT_YYYY_MM_DD)} ${time}`).utc()
        , DateTimeFormat.MOMENT_YYYY_MM_DD_TIME
      );
    }
  }

  addEvent() {
    const formVal =
      this.importType == 'event-group'
        ? this.eventGroupForm.getRawValue()
        : this.eventForm.getRawValue();

    let api = EMPTY;

    if (this.importType == 'event-group') {
      api = 'api/v1/eventgroup/cloneEventgroup';

      formVal.eventGroupStartDate = this.convertTimeZone(
        'GMT',
        formVal.eventGroupStartDate,
        this.startTime
      );

      formVal.eventGroupEndDate = this.convertTimeZone(
        'GMT',
        formVal.eventGroupEndDate,
        this.endTime
      );
    } else {
      api = 'api/v1/event/cloneEvent';

      formVal.eventStartDate = this.convertTimeZone(
        'GMT',
        formVal.eventStartDate,
        this.startTime
      );

      formVal.eventEndDate = this.convertTimeZone(
        'GMT',
        formVal.eventEndDate,
        this.endTime
      );
    }

    if (this.formService.validate(this.getFormValidationMap())) {
      this.http.post(api, formVal).subscribe({
        next: (res: any) => {
          res = JSON.parse(res.body);
          if ((res.statusCode === SUCCESS_CODE) && Utils.isNull(res.errors)) {

            this.dialogRef.close();
            if (this.openParentDialog) {

              if (this.importType == 'event-group') {
                this.eventGroupService.emitReloadEventGroup(true);

                this.eventGroupService.setEventGroupDialogConfigData(
                  this.afterDialogData?.eventGroupDialogMode,
                  res.data,
                  this.afterDialogData?.program,
                  this.afterDialogData?.selectedEventGroupVersion,
                  undefined,
                  undefined
                );
                this.dialog.open(CreateEditEventGroupComponent, {
                  hasBackdrop: true, disableClose: true,
                  ariaLabel: 'create-edit-event-group-dialog'
                });
              } else {
                this.eventService.emitReloadEvent(true);

                this.eventGroupService.setEventGroupDialogConfigData(
                  this.afterDialogData?.eventGroupDialogMode,
                  this.afterDialogData.eventGroup,
                  this.afterDialogData?.program,
                  this.afterDialogData?.selectedEventGroupVersion,
                  undefined,
                  undefined
                );

                this.eventService.setEventDialogConfigData(
                  this.afterDialogData?.mode,
                  res.data,
                  this.openParentDialog,
                  this.eventGroupService.getEventGroupDialogConfigData(),
                  EventGroupStep.EVENTS
                );

                this.dialog.open(
                  CreateEditEventComponent,
                  {
                    width: "1250px",
                    hasBackdrop: true,
                    disableClose: true,
                    ariaLabel: 'create-edit-event-dialog'
                  })
              }
            } else {
            }
          } else {
            const errors = (res?.errors || []).map((err: ResponseError) => {
              if (err.errorMessage.includes('Start date')) {
                err.targetId = this.sDate;
              }
              if (err.errorMessage.includes('End date')) {
                err.targetId = this.eDate;
              }
              return err;
            });

            this.errorMessages = this.formService.prepareErrorObject(errors);
            this.formService.setResponseErrors(errors, this.form);
            this.alertService.showResponseErrors(errors);
          }
        },
        error: err => {
          console.log(err);
        }
      });
    } else {
      this.alertService.showError();
    }

  }

  close() {
    this.dialogRef.close();

    if (this.openParentDialog) {
      if (this.importType == 'event') {
        this.eventGroupService.setEventGroupDialogConfigData(
          this.afterDialogData.eventGroupDialogMode,
          this.eventGroupDetails,
          this.afterDialogData.program,
          this.afterDialogData?.selectedEventGroupVersion,
          false,
          false,
          null,
          EventGroupStep.EVENTS
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
  }

  private getFormValidationMap(): Map<AbstractControl, ValidatorFn | Array<ValidatorFn> | null> {
    const formValidationMap = new Map<AbstractControl, ValidatorFn | Array<ValidatorFn> | null>();

    formValidationMap.set(
      this.form.get(this.name)!,
      [Validators.required]
    );

    formValidationMap.set(
      this.form.get(this.sDate)!,
      [Validators.required]
    );

    formValidationMap.set(
      this.form.get(this.eDate)!,
      [Validators.required]
    );

    return formValidationMap;
  }

  public getErrorMessage(form: UntypedFormGroup, fromControlName: string): string {
    return this.formService.getFormControlErrorMessage(
      form,
      fromControlName,
      this.errorMessages
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    this.eventGroupService.emitReloadEventGroup(false);
    this.eventService.emitReloadEvent(false);
  }
}
