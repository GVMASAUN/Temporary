import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, UntypedFormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { BadgeType, ButtonColor, CALENDAR_PLACEMENT } from '@visa/vds-angular';
import * as moment from 'moment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DateTimeFormat, EMPTY, VisaIcon, WorkFlowAction } from 'src/app/core/constants';
import { STATUS_BADGE_TYPE, STATUS_DESC, StatusCode } from 'src/app/core/models/status.model';
import { UserRole } from 'src/app/core/models/user.model';
import { EventGroup } from 'src/app/pages/programs/event-group.model';
import { DialogMode } from 'src/app/pages/programs/program.model';
import { FormService } from 'src/app/services/form-service/form.service';
import { EventGroupService } from 'src/app/services/program/event-group/event-group.service';
import { DateUtils } from 'src/app/services/util/dateUtils';
import { Utils } from 'src/app/services/utils';

@Component({
  selector: 'app-event-group-basics',
  templateUrl: './event-group-basics.component.html',
  styleUrls: ['./event-group-basics.component.scss'],
})
export class EventGroupBasicsComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input()
  form!: UntypedFormGroup;

  @Input()
  mode: DialogMode = DialogMode.CREATE;

  @Input()
  disabled: boolean = false;

  @Input()
  disabledStartDateTimeMessage: string | null = EMPTY;

  @Input()
  disabledEndDateTimeMessage: string | null = EMPTY;

  @Input()
  disabledApproveOrReject: boolean = false;

  @Input()
  disabledPublish: boolean = false;

  @Input()
  userRole!: UserRole;

  @Input()
  currentUserId!: string;

  @Input()
  isPublishedVersion?: boolean = false;

  @Output()
  workflowChangeEmitter: EventEmitter<WorkFlowAction> = new EventEmitter();

  private destroy$ = new Subject<void>();

  DateFormat = DateTimeFormat;
  BadgeType = BadgeType;
  ButtonColor = ButtonColor;
  DialogMode = DialogMode
  StatusCode = StatusCode;
  WorkFlowAction = WorkFlowAction;
  UserRole = UserRole;
  VisaIcon = VisaIcon;

  CALENDAR_PLACEMENT = CALENDAR_PLACEMENT;
  STATUS_DESC = STATUS_DESC;
  STATUS_BADGE_TYPE = STATUS_BADGE_TYPE;

  dateChanged: boolean = false;

  get eventGroup(): EventGroup {
    return this.form.getRawValue() as EventGroup;
  }

  get timeZone() {
    return DateUtils.getTimeZone();
  }

  constructor(
    private eventGroupService: EventGroupService,
    private formService: FormService
  ) { }

  private getFormValidationMap(): Map<AbstractControl | null, ValidatorFn | Array<ValidatorFn> | null> {
    const formValidationMap = new Map<AbstractControl | null, ValidatorFn | Array<ValidatorFn> | null>();

    const startDateValidations = (this.mode === DialogMode.EDIT)
      ? (this.dateChanged && !this.disabledStartDateTimeMessage ? [Validators.required, this.startDateValidator.bind(this)] : null)
      : [Validators.required, this.startDateValidator.bind(this)];

    const endDateValidations = (this.mode === DialogMode.EDIT)
      ? (this.dateChanged && !this.disabledEndDateTimeMessage ? [Validators.required, this.startDateValidator.bind(this)] : null)
      : [Validators.required, this.dateRangeValidator.bind(this)];

    formValidationMap.set(
      this.form.get('eventGroupName'),
      [Validators.required]
    );

    formValidationMap.set(this.form.get('eventGroupType'),
      [Validators.required]
    );

    formValidationMap.set(this.form.get('eventGroupStartDate'),
      startDateValidations
    );

    formValidationMap.set(this.form.get('eventGroupEndDate'),
      endDateValidations
    );

    formValidationMap.set(this.form.get('eventGroupStartTime'),
      [Validators.required]
    );

    return formValidationMap;
  }

  private dateRangeValidator(): ValidationErrors | null {
    let isValid = true;

    const startDate = this.form.get('eventGroupStartDate')?.value;
    const endDate = this.form.get('eventGroupEndDate')?.value;

    if (startDate && endDate) {
      isValid = DateUtils.dateRangeValidator(startDate, endDate);

      if (!isValid) {
        return { dateRangeError: true }
      }
    }

    return null;
  }

  private startDateValidator(): ValidationErrors | null {
    let isValid = true;

    const startDate = this.form.get('eventGroupStartDate')?.value;
    const currentDate = moment().toDate();

    if (startDate) {
      isValid = DateUtils.dateRangeValidator(currentDate, startDate);

      if (!isValid) {
        return { startDateError: true }
      }
    }

    return null;
  }

  private registerOnChangeListeners() {
    this.form.get('eventGroupStartDate')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        if (value) {

          const eventGroupStartDate = DateUtils.formatDateTime(this.form.value.eventGroupStartDate, DateTimeFormat.MOMENT_YYYY_MM_DD);

          const formatValue = DateUtils.formatDateTime(value, DateTimeFormat.MOMENT_YYYY_MM_DD);

          if (formatValue !== eventGroupStartDate) {
            this.dateChanged = true;
            this.formService.updateValidations(this.getFormValidationMap());
          }

          this.form.get('formattedStartDate')?.patchValue(DateUtils.formatDateTime(value, DateTimeFormat.MOMENT_YYYY_MM_DD),
            { onlySelf: true, emitEvent: false }
          );
        }
      });

    this.form.get('eventGroupEndDate')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        if (value) {

          const eventGroupEndDate = DateUtils.formatDateTime(this.form.value.eventGroupEndDate, DateTimeFormat.MOMENT_YYYY_MM_DD);
          const formatValue = DateUtils.formatDateTime(value, DateTimeFormat.MOMENT_YYYY_MM_DD);

          if (formatValue !== eventGroupEndDate) {
            this.dateChanged = true;
            this.formService.updateValidations(this.getFormValidationMap());
          }

          this.form.get('formattedEndDate')?.patchValue(
            DateUtils.formatDateTime(value, DateTimeFormat.MOMENT_YYYY_MM_DD),
            { onlySelf: true, emitEvent: false }
          );
        }
      });
  }


  ngOnInit(): void {
    this.registerOnChangeListeners();
  }

  ngAfterViewInit(): void {
    this.formService.clearFormControlValidators(this.form);
  }

  getErrorMessage(form: UntypedFormGroup, controlName: string): string {
    return this.eventGroupService.getErrorMessage(this.form, controlName);
  }

  handleTimeChange(event: any, formControlName: string) {
    this.form.get(formControlName)?.patchValue(event?.target?.value || EMPTY);
  }

  validate(): boolean {
    return this.formService.validate(this.getFormValidationMap());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
