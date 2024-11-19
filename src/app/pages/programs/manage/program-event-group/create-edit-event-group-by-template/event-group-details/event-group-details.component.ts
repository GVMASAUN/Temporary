import { HttpStatusCode } from '@angular/common/http';
import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { AbstractControl, UntypedFormArray, UntypedFormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { AccordionComponent, BadgeType, ButtonColor, ButtonIconType, CALENDAR_PLACEMENT, ComboboxType } from '@visa/vds-angular';
import { cloneDeep } from 'lodash';
import * as moment from 'moment';
import { Subject, forkJoin } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { COMMA, DateTimeFormat, EMPTY, NUMBER_PATTERN, VisaIcon, WorkFlowAction } from 'src/app/core/constants';
import { Option } from 'src/app/core/models/option.model';
import { PaginationResponse } from 'src/app/core/models/pagination-response.model';
import { STATUS_BADGE_TYPE, STATUS_DESC, StatusCode } from 'src/app/core/models/status.model';
import { UserRole } from 'src/app/core/models/user.model';
import { EventGroup } from 'src/app/pages/programs/event-group.model';
import { AttributeCategory, CustomFieldValueList, Event, EventAction, EventActionFulfillmentMonetaryType, EventActionType, EventAttribute, EventCondition, EventConditionAction, RECURRENCE_LIMIT_DESC, RecurrenceLimit } from 'src/app/pages/programs/event.model';
import { DialogMode } from 'src/app/pages/programs/program.model';
import { CustomFormGroup, FormBuilder, FormService } from 'src/app/services/form-service/form.service';
import { EventActionService } from 'src/app/services/program/event-action/event-action.service';
import { EventGroupService } from 'src/app/services/program/event-group/event-group.service';
import { AttributeService } from 'src/app/services/program/event/attribute/attribute.service';
import { EventService } from 'src/app/services/program/event/event.service';
import { ToggleAlertService } from 'src/app/services/toggle-alert/toggle-alert.service';
import { DateUtils } from 'src/app/services/util/dateUtils';
import { FunctionsService } from 'src/app/services/util/functions.service';
import { Utils } from 'src/app/services/utils';
import { CreateEditConditionComponent } from '../../create-edit-event/event-conditions/create-edit-condition/create-edit-condition.component';
import { EventDetailsComponent } from '../../create-edit-event/event-details/event-details.component';

@Component({
  selector: 'app-event-group-details',
  templateUrl: './event-group-details.component.html',
  styleUrls: ['./event-group-details.component.scss']
})
export class EventGroupDetailsComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild(EventDetailsComponent)
  eventDetailsComponent!: EventDetailsComponent;

  @ViewChildren(AccordionComponent)
  accordions!: QueryList<AccordionComponent>;

  @ViewChildren(CreateEditConditionComponent)
  conditionComponents!: QueryList<CreateEditConditionComponent>;

  @Input()
  form!: CustomFormGroup<EventGroup>;

  @Input()
  mode: DialogMode = DialogMode.CREATE;

  @Input()
  disabled: boolean = false;

  @Input()
  disabledStartDateTimeMessage: string | null = EMPTY;

  @Input()
  disabledEndDateTimeMessage: string | null = EMPTY;

  @Input()
  editable: boolean = false;

  @Input()
  disabledApproveOrReject: boolean = false;

  @Input()
  disabledPublish: boolean = false;

  @Input()
  userRole!: UserRole;

  @Input()
  currentUserId!: string;

  @Input()
  scrollViewId!: string;

  @Input()
  isPublishedVersion?: boolean = false;

  @Output()
  workflowChangeEmitter: EventEmitter<WorkFlowAction> = new EventEmitter();

  @Output()
  initDataEmitter: EventEmitter<boolean> = new EventEmitter();

  private destroy$ = new Subject<void>();

  DateFormat = DateTimeFormat;
  BadgeType = BadgeType;
  ButtonColor = ButtonColor;
  ButtonIconType = ButtonIconType;
  ComboboxType = ComboboxType;
  DialogMode = DialogMode
  StatusCode = StatusCode;
  WorkFlowAction = WorkFlowAction;
  UserRole = UserRole;
  VisaIcon = VisaIcon;
  EventActionFulfillmentMonetaryType = EventActionFulfillmentMonetaryType;
  EventConditionAction = EventConditionAction;
  AttributeCategory = AttributeCategory;
  RecurrenceLimit = RecurrenceLimit;
  EventActionType = EventActionType;

  CALENDAR_PLACEMENT = CALENDAR_PLACEMENT;
  STATUS_DESC = STATUS_DESC;
  STATUS_BADGE_TYPE = STATUS_BADGE_TYPE;

  initializeEventActionForm: boolean = false;
  initData: boolean = false;
  dateChanged: boolean = false;


  selectedRewardType: any;

  eventActionEndpoints: any[] = [];
  endPointMessageList: any[] = [];
  actionTypeList: any[] = [];
  amountTypeList: { id: string; name: string }[] = [];

  eventConditionAttributesForEvent: EventAttribute[] = [];
  eventConditionAttributesForTargeting: EventAttribute[] = [];
  eventConditionAttributeGroupsForEvent: any[] = [];
  eventConditionAttributeGroupsForTargeting: any[] = [];


  systemFieldsList: string[] = [];

  userFieldsList: CustomFieldValueList[] = [];

  recurrenceLimits: Option[] = [
    new Option(RecurrenceLimit.Once, RECURRENCE_LIMIT_DESC[RecurrenceLimit.Once]),
    new Option(RecurrenceLimit.NoLimit, RECURRENCE_LIMIT_DESC[RecurrenceLimit.NoLimit]),
    new Option(RecurrenceLimit.UpTo, RECURRENCE_LIMIT_DESC[RecurrenceLimit.UpTo])
  ];

  get eventGroup(): EventGroup {
    return this.form.getRawValue() as EventGroup;
  }

  get timeZone(): string {
    return DateUtils.getTimeZone();
  }

  get showStatusDetails(): boolean {
    return this.mode !== DialogMode.CREATE
  }

  constructor(
    private eventGroupService: EventGroupService,
    private eventActionService: EventActionService,
    private eventService: EventService,
    private functionService: FunctionsService,
    private formBuilder: FormBuilder,
    private formService: FormService,
    private attributeService: AttributeService,
    private alertService: ToggleAlertService
  ) { }

  private groupBySubCategory(category: AttributeCategory, attributes: EventAttribute[]) {

    const groups = this.eventService.getEventAttributesGroupBySubCategory(attributes);

    category === AttributeCategory.EVENT
      ? this.eventConditionAttributeGroupsForEvent = groups
      : this.eventConditionAttributeGroupsForTargeting = groups;
  }

  private setEventConditionAttributes(category: AttributeCategory) {
    const params = {
      eventAttrCategory: category
    };

    return this.attributeService.getAttributes(params)
      .pipe(
        map(response => {
          if (Utils.isNull(response.errors) && (response.statusCode === HttpStatusCode.Ok)) {
            const attributes = response.data || [];
            const requiredAttributeForCompoundField =
              attributes.find(att => !!att.compoundField && !!att.associatedAttribute)?.associatedAttribute;

            if (!!requiredAttributeForCompoundField) {
              attributes.push(requiredAttributeForCompoundField);
            }
            if (category === AttributeCategory.EVENT) {
              this.eventConditionAttributesForEvent = attributes;
              this.groupBySubCategory(category, this.eventConditionAttributesForEvent);

            } else {
              this.eventConditionAttributesForTargeting = attributes;
              this.groupBySubCategory(category, this.eventConditionAttributesForTargeting);
            }
          } else {
            this.alertService.showResponseErrors(response.errors);
          }

        })
      );
  }


  private setEndpoints() {
    return this.eventActionService.getEndpoints()
      .pipe(map((res: any) => {
        res = JSON.parse(res.body);
        this.eventActionEndpoints = (res.communityEndPoints || []);

        this.initializeEventActionForm = true;
      }
      ));
  }

  private setEndpointMessages() {
    return this.eventActionService.getEndpointsMessageList()
      .pipe(
        map((res: any) => {
          res = JSON.parse(res.body);
          this.endPointMessageList = res.data;
        }
        ));
  }


  private setEventActionTypes() {
    return this.eventActionService.getActionTypes()
      .pipe(
        map((res: any) => {
          res = JSON.parse(res.body);
          this.actionTypeList = res.data;

        })
      );
  }

  private setAmountType() {
    return this.eventActionService.getAmountTypes().pipe(
      map((res: any) => {
        res = JSON.parse(res.body);
        this.amountTypeList = res;
      })
    );
  }


  private mapUserFields(response: any, eventAction: EventAction, eventActionForm: UntypedFormGroup) {
    if (eventAction) {
      const customFieldFormArray = eventActionForm?.get('customFieldValueList') as UntypedFormArray;

      const values: CustomFieldValueList[] = cloneDeep(customFieldFormArray.value);

      customFieldFormArray.controls = [];

      response.data.userDefinedField
        ?.split(COMMA)
        .map((field: string) => {

          const valueFormGroup: UntypedFormGroup = this.formBuilder.group(new CustomFieldValueList());

          valueFormGroup.get('key')?.patchValue(field);

          const existValidValue = values.find(value => value.key === field);

          if (existValidValue?.value) {
            valueFormGroup.get('value')?.patchValue(existValidValue.value);
          }

          customFieldFormArray.push(valueFormGroup);
          customFieldFormArray.updateValueAndValidity();
        });
    }
  }

  private setSystemAndUserFields(selectedMessageId: string, eventActionForm: UntypedFormGroup) {
    const eventAction: EventAction = eventActionForm.getRawValue() as EventAction;

    this.eventActionService.getEndpointsMessageDetailsList(
      selectedMessageId,
      // (this.mode === DialogMode.CREATE)
      //   ? eventAction.communityCode!
      //   : undefined
    ).subscribe(
      (res: any) => {
        const response: PaginationResponse<any> = JSON.parse(res.body);

        if (Utils.isNull(response.errors) && response.statusCode === HttpStatusCode.Ok) {
          this.userFieldsList = [];
          this.systemFieldsList = [];


          this.systemFieldsList = response.data.systemDefinedField.split(COMMA);

          this.mapUserFields(response, eventAction, eventActionForm);
        } else {
          this.alertService.showResponseErrors(response.errors);
        }

      }
    );
  }

  private init() {
    this.setEndpoints().subscribe(
      {
        next: any => {
        },
        error: error => {
          console.log(error);
        }
      }
    )

    this.initData = false;

    forkJoin([
      this.setEndpointMessages(),
      this.setEventActionTypes(),
      this.setAmountType(),
      this.setEventConditionAttributes(AttributeCategory.EVENT),
      this.setEventConditionAttributes(AttributeCategory.TARGETING)
    ]).pipe(takeUntil(this.destroy$))
      .subscribe(
        {
          next: any => {
            this.initData = true;

            setTimeout(() => {
              this.initDataEmitter.emit(true);

            }, 1000);
          },
          error: error => {
            console.log(error);
          },
          complete: () => {
            setTimeout(() => {
              this.formService.clearFormControlValidators(this.form);
            }, 0);

            setTimeout(() => {
              this.initDataEmitter.emit(true);

            }, 1000);
          }
        }
      );
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

          this.form.get('formattedStartDate')?.patchValue(formatValue,
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

  private setEventActionValidators(actionGroup: UntypedFormGroup, formValidationMap: Map<AbstractControl | null, ValidatorFn | Array<ValidatorFn> | null>) {
    const eventAction: EventAction = this.getFormValue(actionGroup);

    const isEndpointEventAction = ((EventActionType.EndpointAggregate === eventAction.eventActionType) || (EventActionType.Endpoint === eventAction.eventActionType));

    const isPercentageRewardType = !isEndpointEventAction && (eventAction.fulfillmentMonetaryType === EventActionFulfillmentMonetaryType.Pct);
    const isFixedRewardType = !isEndpointEventAction && (eventAction.fulfillmentMonetaryType === EventActionFulfillmentMonetaryType.Fixed);

    //Endpoint
    formValidationMap.set(
      actionGroup.get('endpointUrlName'),
      isEndpointEventAction
        ? [
          Validators.required,
        ] : null
    );

    //Select Endpoint Message
    formValidationMap.set(
      actionGroup.get('endpointMessageId'),
      isEndpointEventAction
        ? [
          Validators.required,
        ] : null
    );

    //Reward Type
    formValidationMap.set(
      actionGroup.get('fulfillmentMonetaryType'),
      !isEndpointEventAction
        ? [
          Validators.required,
        ] : null
    );


    //Percentage (%)
    formValidationMap.set(
      actionGroup.get('fulfillmentMonetaryValue'),
      isPercentageRewardType
        ? [
          Validators.required,
        ] : null
    );

    //Max Amount Permitted (USD)
    formValidationMap.set(
      actionGroup.get('fulfillmentConstraint'),
      isPercentageRewardType
        ? [
          Validators.required,
        ] : null
    );


    //Transaction Attribute
    formValidationMap.set(
      actionGroup.get('amountType'),
      isPercentageRewardType
        ? [
          Validators.required,
        ] : null
    );

    //Amount (USD)
    formValidationMap.set(
      actionGroup.get('fulfillmentMonetaryValue'),
      (isFixedRewardType || isPercentageRewardType)
        ? [
          Validators.required,
        ] : null
    );


    //Merchant Descriptor Name
    formValidationMap.set(
      actionGroup.get('merchantDescriptor'),
      (isFixedRewardType || isPercentageRewardType)
        ? [
          Validators.required,
        ] : null
    );
  }

  private getFormValidationMap(): Map<AbstractControl | null, ValidatorFn | Array<ValidatorFn> | null> {
    const formValidationMap = new Map<AbstractControl | null, ValidatorFn | Array<ValidatorFn> | null>();

    const startDateValidations = (this.mode === DialogMode.EDIT)
      ? (this.dateChanged && !this.disabledStartDateTimeMessage ? [Validators.required, this.startDateValidator.bind(this)] : null)
      : [Validators.required, this.startDateValidator.bind(this)];

    const endDateValidations = (this.mode === DialogMode.EDIT)
      ? (this.dateChanged && !this.disabledEndDateTimeMessage ? [Validators.required, this.dateRangeValidator.bind(this)] : null)
      : [Validators.required, this.dateRangeValidator.bind(this)];

    formValidationMap.set(
      this.form.controls.eventGroupName,
      [Validators.required]
    );

    formValidationMap.set(
      this.form.controls.eventGroupType,
      [Validators.required]
    );

    formValidationMap.set(
      this.form.controls.eventGroupStartDate,
      startDateValidations
    );

    formValidationMap.set(
      this.form.controls.eventGroupEndDate,
      endDateValidations
    );

    const eventFormGroups = this.getFormArray(this.form, 'eventStageList');
    if (Utils.isNotNull(eventFormGroups)) {
      eventFormGroups.map(group => {
        if (group.get('recurrenceLimit')?.value >= RecurrenceLimit.UpTo) {
          formValidationMap.set(
            group.get('occurrence'),
            [
              Validators.required,
              Validators.pattern(NUMBER_PATTERN),
              this.eventService.occurrenceRangeValidator.bind(this, group.get('occurrence')?.value)
            ]
          );
        }

        const eventActionFormGroups = this.getFormArray(group, 'eventActions');

        if (Utils.isNotNull(eventActionFormGroups)) {
          eventActionFormGroups.map(actionGroup => {
            this.setEventActionValidators(actionGroup, formValidationMap);
          });
        }
      });
    }

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

  handleDateChange() {
    this.dateChanged = true;

    this.formService.updateValidations(this.getFormValidationMap());
  }

  ngAfterViewInit(): void {
    this.formService.clearFormControlValidators(this.form);
  }

  ngOnInit(): void {
    this.init();

    this.registerOnChangeListeners();
  }

  getEventAccordionViewId(event: Event): string {
    return this.eventService.getEventAccordionViewId(event);
  }

  getEventActionAccordionViewId(eventAction: EventAction): string {
    return this.eventActionService.getEventActionAccordionViewId(eventAction);
  }

  getErrorMessage(form: UntypedFormGroup, controlName: string): string {
    return this.eventGroupService.getErrorMessage(form, controlName);
  }

  handleTimeChange(event: any, formControlName: string) {
    this.form.get(formControlName)?.patchValue(event?.target?.value || EMPTY);
  }

  validate(): boolean {
    let isConditionsValid = false;

    if (Utils.isNotNull(this.conditionComponents)) {
      isConditionsValid = this.conditionComponents.toArray().reduce((acc: boolean, curr: CreateEditConditionComponent) => (!!acc && curr?.validate()), true);
    }

    const isEventDetailsValid = this.formService.validate(this.getFormValidationMap());

    return isEventDetailsValid && isConditionsValid;
  }

  handleEventConditionSubmitRequest(eventDetails: Event | null = null) {
  }

  getFormArray(formGroup: UntypedFormGroup, fromArrayName: string): UntypedFormGroup[] {
    return (formGroup.get(fromArrayName) as UntypedFormArray).controls as UntypedFormGroup[];
  }

  getEventConditionFormGroup(formGroup: UntypedFormGroup) {
    return formGroup as CustomFormGroup<EventCondition>;
  }

  getFormValue(formGroup: UntypedFormGroup): any {
    return formGroup.getRawValue();
  }

  handleEventActionAccordionChange() {
    this.initializeEventActionForm = true;
  }

  handleMessageChange(selectedValues: string[], formGroup: UntypedFormGroup) {
    const selectedValue = selectedValues.join();

    this.setSystemAndUserFields(selectedValue, formGroup);
  }

  handleEventConditionSubmit(condition: any) {

  }

  eventTrackBy(index: number, item: any) {


    return EMPTY.concat(index.toString(), item.eventGroupId, item.eventId, item.eventName)
  }

  eventActionTrackBy(index: number, item: any) {
    return EMPTY.concat(index.toString(), item.actionName);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
