import { HttpStatusCode } from '@angular/common/http';
import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { CALENDAR_PLACEMENT } from '@visa/vds-angular';
import * as moment from 'moment';
import { Subject } from 'rxjs';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { DateTimeFormat, EMPTY, NUMBER_PATTERN, VisaIcon } from 'src/app/core/constants';
import { Option } from 'src/app/core/models/option.model';
import { STATUS_BADGE_TYPE, STATUS_DESC, StatusCode } from 'src/app/core/models/status.model';
import { EventTemplate } from 'src/app/pages/event-group-template/event-group-template.model';
import { EventGroup } from 'src/app/pages/programs/event-group.model';
import { EVENT_TYPE_DESC, Event, EventType, RECURRENCE_LIMIT_DESC, RecurrenceLimit, StatementCreditStatus } from 'src/app/pages/programs/event.model';
import { DialogMode } from 'src/app/pages/programs/program.model';
import { FormService } from 'src/app/services/form-service/form.service';
import { EventService } from 'src/app/services/program/event/event.service';
import { ToggleAlertService } from 'src/app/services/toggle-alert/toggle-alert.service';
import { DateUtils } from 'src/app/services/util/dateUtils';
import { Utils } from 'src/app/services/utils';

@Component({
  selector: 'app-event-details',
  templateUrl: './event-details.component.html',
  styleUrls: ['./event-details.component.scss'],
})
export class EventDetailsComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input()
  form!: UntypedFormGroup;

  @Input()
  dialogMode!: DialogMode;

  @Input()
  eventGroupDetails!: EventGroup;

  @Input()
  disabled: boolean = false;

  @Input()
  disabledStartDateTimeMessage: string | null = EMPTY;

  @Input()
  disabledEndDateTimeMessage: string | null = EMPTY;

  @Input()
  isTemplateEvent: boolean = false;

  private destroy$ = new Subject<void>();

  dateChanged: boolean = false;

  DateFormat = DateTimeFormat;
  StatusCode = StatusCode;
  RecurrenceLimit = RecurrenceLimit;
  DialogMode = DialogMode;
  EventType = EventType;
  VisaIcon = VisaIcon;

  CALENDAR_PLACEMENT = CALENDAR_PLACEMENT;
  STATUS_BADGE_TYPE = STATUS_BADGE_TYPE;
  STATUS_DESC = STATUS_DESC;

  eventTypes: Option[] = [];
  recurrenceLimits: Option[] = [];
  statementCreditEventIds: Option[] = [];
  statementCreditStatuses: Option[] = [];



  get event(): Event | EventTemplate {
    return this.form.getRawValue() as Event | EventTemplate;
  }

  get timeZone() {
    return DateUtils.getTimeZone();
  }

  constructor(
    private eventService: EventService,
    private formService: FormService,
    private alertService: ToggleAlertService
  ) { }


  ngOnInit(): void {
    this.registerOnChangeListeners();
    this.init();
  }

  ngAfterViewInit(): void {
    this.formService.clearFormControlValidators(this.form);
  }

  private registerOnChangeListeners() {
    this.form.get('eventStartDate')?.valueChanges
      .pipe(takeUntil(this.destroy$)).subscribe(value => {
        if (value) {

          const eventStartDate = DateUtils.formatDateTime(this.form.value.eventStartDate, DateTimeFormat.MOMENT_YYYY_MM_DD);
          const formatValue = DateUtils.formatDateTime(value, DateTimeFormat.MOMENT_YYYY_MM_DD);

          if (formatValue !== eventStartDate) {
            this.dateChanged = true;
            this.formService.updateValidations(this.getFormValidationMap());
          }

          this.formatDate(value, 'formattedStartDate');
        }
      });

    this.form.get('eventEndDate')?.valueChanges
      .pipe(takeUntil(this.destroy$)).subscribe(value => {
        if (value) {

          const eventEndDate = DateUtils.formatDateTime(this.form.value.eventEndDate, DateTimeFormat.MOMENT_YYYY_MM_DD);
          const formatValue = DateUtils.formatDateTime(value, DateTimeFormat.MOMENT_YYYY_MM_DD);

          if (formatValue !== eventEndDate) {
            this.dateChanged = true;
            this.formService.updateValidations(this.getFormValidationMap());
          }

          this.formatDate(value, 'formattedEndDate');
        }
      });

    this.form.get('eventTypeId')?.valueChanges
      .pipe(distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(value => {
        if ((Number(value) == EventType.Statement_Credit_Response)) {
          this.setStatementCreditEvents();
          this.setStatementCreditStatuses();
        }
      });
  }

  private init() {
    this.setEventTypes();
    this.setRecurrenceLimits();
  }

  private setEventTypes() {
    Object.values(EventType)
      .map((item: any) => {
        const eventType = item as EventType;

        if (!!EVENT_TYPE_DESC[eventType]) {
          this.eventTypes.push(new Option(eventType, EVENT_TYPE_DESC[eventType]));
        }
      });

    this.eventTypes.sort((a, b) => a.label.localeCompare(b.label));
  }

  private setRecurrenceLimits() {
    this.recurrenceLimits = [
      new Option(RecurrenceLimit.Once, RECURRENCE_LIMIT_DESC[RecurrenceLimit.Once]),
      new Option(RecurrenceLimit.NoLimit, RECURRENCE_LIMIT_DESC[RecurrenceLimit.NoLimit]),
      new Option(RecurrenceLimit.UpTo, RECURRENCE_LIMIT_DESC[RecurrenceLimit.UpTo])
    ];
  }

  private setStatementCreditEvents() {
    const params: any = {
      communityCode: this.event.communityCode
    };

    this.eventService.getStatementCreditEvents(params)
      .pipe(takeUntil(this.destroy$)).subscribe(response => {

        if ((response.statusCode === HttpStatusCode.Ok) && Utils.isNull(response.errors)) {
          this.statementCreditEventIds.push(...response.data.map(item => new Option(Number(item.id), item.name)));
        } else {
          this.alertService.showResponseErrors(response.errors);
        }
      });
  }

  private setStatementCreditStatuses() {
    this.statementCreditStatuses.push(
      new Option(StatementCreditStatus.Failure, StatementCreditStatus.Failure),
      new Option(StatementCreditStatus.Success, StatementCreditStatus.Success)
    );
  }

  private formatDate(event: any, controlName: string) {
    const formattedDate = DateUtils.formatDateTime(event, DateTimeFormat.MOMENT_YYYY_MM_DD);
    this.form.get(controlName)?.patchValue(formattedDate, { onlySelf: true, emitEvent: false });
  }

  private getFormValidationMap(): Map<AbstractControl | null, ValidatorFn | Array<ValidatorFn> | null> {
    const formValidationMap = new Map<AbstractControl | null, ValidatorFn | Array<ValidatorFn> | null>();

    const startDateValidations = (this.dialogMode === DialogMode.EDIT)
      ? (this.dateChanged && !this.disabledStartDateTimeMessage ? [Validators.required, this.startDateValidator.bind(this), this.eventStartDateRangeValidator.bind(this)] : null)
      : [Validators.required, this.startDateValidator.bind(this), this.eventStartDateRangeValidator.bind(this)];

    const endDateValidations = (this.dialogMode === DialogMode.EDIT && this.dateChanged)
      ? (this.dateChanged && !this.disabledEndDateTimeMessage ? [Validators.required, this.dateRangeValidator.bind(this), this.eventEndDateRangeValidator.bind(this)] : null)
      : [Validators.required, this.dateRangeValidator.bind(this), this.eventEndDateRangeValidator.bind(this)];

    formValidationMap.set(
      this.form.get('eventName'),
      [Validators.required]
    );

    formValidationMap.set(
      this.form.get('eventTypeId'),
      [Validators.required]
    );

    formValidationMap.set(
      this.form.get('recurrenceLimit'),
      [Validators.required]
    );

    formValidationMap.set(
      this.form.get('eventStartDate'),
      startDateValidations
    );

    formValidationMap.set(
      this.form.get('eventEndDate'),
      endDateValidations
    );

    if (this.form.get('recurrenceLimit')?.value >= RecurrenceLimit.UpTo) {
      formValidationMap.set(
        this.form.get('occurrence'),
        [Validators.required, Validators.pattern(NUMBER_PATTERN), this.eventService.occurrenceRangeValidator.bind(this, this.event.occurrence!)]
      );
    }

    return formValidationMap;
  }

  private dateRangeValidator(): ValidationErrors | null {
    let isValid = true;

    const startDate = this.form.get('eventStartDate')?.value;
    const endDate = this.form.get('eventEndDate')?.value;

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

    const startDate = this.form.get('eventStartDate')?.value;
    const currentDate = moment().toDate();

    if (startDate) {
      isValid = DateUtils.dateRangeValidator(currentDate, startDate);

      if (!isValid) {
        return { startDateError: true }
      }
    }

    return null;
  }

  private eventStartDateRangeValidator(): ValidationErrors | null {
    let isValid = true;

    const eventstartDate = this.form.get('eventStartDate')?.value;
    const eventGroupStartDate = this.eventGroupDetails.eventGroupStartDate;
    const eventGroupEndDate = this.eventGroupDetails.eventGroupEndDate;

    if (eventstartDate && eventGroupStartDate) {
      if (DateUtils.dateRangeValidator(eventGroupStartDate, eventstartDate, true)) {
        isValid = DateUtils.dateRangeValidator(eventstartDate, eventGroupEndDate, true);
      } else {
        return { eventDateRangeError: true }
      }

      if (!isValid) {
        return { eventDateRangeError: true }
      }
    }

    return null;
  }

  private eventEndDateRangeValidator(): ValidationErrors | null {
    let isValid = true;

    const eventEndDate = this.form.get('eventEndDate')?.value;
    const eventGroupEndDate = this.eventGroupDetails.eventGroupEndDate;

    if (eventEndDate && eventGroupEndDate) {
      isValid = DateUtils.dateRangeValidator(eventEndDate, eventGroupEndDate, true);

      if (!isValid) {
        return { eventDateRangeError: true }
      }
    }

    return null;
  }

  validate(): boolean {
    return this.formService.validate(this.getFormValidationMap());
  }

  getErrorMessage(form: UntypedFormGroup, controlName: string): string {
    return this.eventService.getErrorMessage(this.form, controlName);
  }

  showOccurrenceInput(): boolean {
    const value = this.form.get('recurrenceLimit')?.value;

    return value === RecurrenceLimit.UpTo || value > RecurrenceLimit.UpTo || false;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
