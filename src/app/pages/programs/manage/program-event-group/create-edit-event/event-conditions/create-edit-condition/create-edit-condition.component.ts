import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import {
  AbstractControl,
  UntypedFormArray,
  UntypedFormGroup,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ButtonIconType, CALENDAR_PLACEMENT } from '@visa/vds-angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  COMMA,
  CONFIRM_MESSAGE,
  DAY_END_TIME,
  DAY_START_TIME,
  DateTimeFormat,
  EMPTY,
  NUMBER_PATTERN,
  SUCCESS_CODE,
  VisaIcon
} from 'src/app/core/constants';
import { Option } from 'src/app/core/models/option.model';
import { PaginationResponse } from 'src/app/core/models/pagination-response.model';
import { EventTemplate } from 'src/app/pages/event-group-template/event-group-template.model';
import { AttributeCategory, CriteriaValues, Event, EventAttribute, EventAttributeOperatorType, EventAttributeType, EventCondition, EventConditionAction, SpecialAttribute } from 'src/app/pages/programs/event.model';
import {
  DialogMode
} from 'src/app/pages/programs/program.model';
import { CustomFormGroup, FormBuilder, FormService } from 'src/app/services/form-service/form.service';
import { AttributeService } from 'src/app/services/program/event/attribute/attribute.service';
import { EventService } from 'src/app/services/program/event/event.service';
import { ProgramService } from 'src/app/services/program/program.service';
import { ToggleAlertService } from 'src/app/services/toggle-alert/toggle-alert.service';
import { DateUtils } from 'src/app/services/util/dateUtils';
import { Utils } from 'src/app/services/utils';
import { CompletedEventSelectorDialogComponent } from './completed-event-selector-dialog/completed-event-selector-dialog.component';

@Component({
  selector: 'app-create-edit-condition',
  templateUrl: './create-edit-condition.component.html',
  styleUrls: ['./create-edit-condition.component.scss']
})
export class CreateEditConditionComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input()
  eventConditionForm: CustomFormGroup<EventCondition> = this.getNewEventConditionForm();

  @Input()
  eventFormGroup!: UntypedFormGroup;

  @Input()
  attributeCategory!: AttributeCategory;

  @Input()
  action: EventConditionAction = EventConditionAction.ADD;

  @Input()
  eventDialogMode!: DialogMode;

  @Input()
  event!: EventTemplate;

  @Input()
  eventConditionDetails!: EventCondition | null;

  @Input()
  isTemplateEvent: boolean = false;

  @Input()
  creatingByEventGroupTemplate: boolean = false;

  @Input()
  disabled: boolean = false;

  @Input()
  attributes: EventAttribute[] = [];

  @Input()
  attributeGroups: any[] = [];


  @Output()
  onSubmitEmitter: EventEmitter<any> = new EventEmitter();

  private destroy$ = new Subject<void>();

  ButtonIconType = ButtonIconType;
  EventAttributeType = EventAttributeType;
  DateFormat = DateTimeFormat;
  EventAttributeOperatorType = EventAttributeOperatorType;
  AttributeCategory = AttributeCategory;
  SpecialAttribute = SpecialAttribute;
  EventConditionAction = EventConditionAction;
  CALENDAR_PLACEMENT = CALENDAR_PLACEMENT;
  DAY_START_TIME = DAY_START_TIME;
  DAY_END_TIME = DAY_END_TIME;
  NUMBER_PATTERN = NUMBER_PATTERN;
  CONFIRM_MESSAGE = CONFIRM_MESSAGE;
  VisaIcon = VisaIcon;

  initializeForm: boolean = true;
  initComparisonValues: boolean = false;
  isLoading: boolean = false;


  get eventCondition(): EventCondition {
    return this.eventConditionForm.getRawValue() as EventCondition;
  }

  get showComparisonValueField(): boolean {
    return !(this.isTemplateEvent && (this.eventConditionForm?.value?.selectedAttribute?.attributeDisplayName === SpecialAttribute.MERCHANT_GROUP_NAME))
  }

  getEventConditionFormData(formGroup: UntypedFormGroup): EventCondition {
    return formGroup.getRawValue() as EventCondition;
  }

  criteriaValuesForm(formGroup: UntypedFormGroup): UntypedFormGroup {
    return formGroup.get('criteriaValues') as UntypedFormGroup;
  }

  getDependentEventConditionFormGroups(
    eventConditionForm: CustomFormGroup<EventCondition>,
    recursive: boolean = false
  ): CustomFormGroup<EventCondition>[] {
    const groups: CustomFormGroup<EventCondition>[] = (eventConditionForm?.controls?.dependentEventConditions as UntypedFormArray)?.controls?.map(con => con as CustomFormGroup<EventCondition>);

    if (recursive && Utils.isNotNull(groups)) {
      for (const conditionForm of groups) {
        groups.push(...this.getDependentEventConditionFormGroups(conditionForm));
      }
    }

    return groups;
  }

  constructor(
    private attributeService: AttributeService,
    private formBuilder: FormBuilder,
    private eventService: EventService,
    private formService: FormService,
    private programService: ProgramService,
    private alertService: ToggleAlertService,
    private dialog: MatDialog
  ) { }

  private init() {
    if (this.action === EventConditionAction.ADD) {
      this.eventConditionForm.controls.attributeCategory.patchValue(this.attributeCategory);
    } else {
      this.mapEventCondition();

    }
  }

  private mapEventCondition(
    eventConditionForm = this.eventConditionForm,
    response: EventCondition | null = this.eventConditionDetails,
    parentEventCondition?: EventCondition
  ) {
    this.initializeForm = false;

    let selectedAttribute;
    if (response) {
      selectedAttribute = this.getAttributeById(response.eventAttributeId);

      const isAssociatedEventCondition = !selectedAttribute && !!parentEventCondition;

      if (isAssociatedEventCondition) {
        const parentEventAttribute = this.getAttributeById(parentEventCondition?.eventAttributeId);
        selectedAttribute = parentEventAttribute?.associatedAttribute;
      }

      eventConditionForm.patchValue(response);
      eventConditionForm.markAsPristine();

      this.setUiRelatedData(eventConditionForm, selectedAttribute!, isAssociatedEventCondition);

      if (Utils.isNotNull(response.dependentEventConditions)) {
        const conditionFormArray = eventConditionForm?.controls?.dependentEventConditions as UntypedFormArray;
        conditionFormArray.controls = [];

        for (const dependentCondition of response?.dependentEventConditions!) {
          const group: CustomFormGroup<EventCondition> = this.getNewEventConditionForm();
          group.patchValue(dependentCondition);
          this.mapEventCondition(group, dependentCondition, response);
          conditionFormArray.push(group);
        }
      }
    }

    this.initializeForm = true;

  }

  private setAttributeComparisonValues(
    selectedAttribute: EventAttribute,
    eventConditionForm: CustomFormGroup<EventCondition>
  ) {
    if (selectedAttribute?.isApiAttributeType) {
      this.initComparisonValues = false;

      const params: any = {
        communityCode: this.programService.communityCode
      };

      if (selectedAttribute) {
        this.isLoading = true;

        this.attributeService
          .getAttributeValues(
            selectedAttribute.apiPath!,
            selectedAttribute.attributeId!,
            params
          )
          .subscribe({
            next: (res) => {
              this.isLoading = false;
              const comparisonValues = (res.data || []).map(
                (item) =>
                  new Option(
                    selectedAttribute.multiSelect
                      ? { id: item.id, label: item.label }
                      : item.id,
                    item.label,
                    item
                  )
              );

              eventConditionForm
                .get('attributeComparisonValues')
                ?.patchValue(comparisonValues);

              this.initComparisonValues = true;
            },
            error: (error) => {
              this.isLoading = false;
            },
            complete: () => {
              setTimeout(() => {
                this.clearFormValidations();
              }, 0);
            }
          });
      }
    }
  }

  private getAttributeById(attributeId: string | number | null | undefined) {
    return this.attributes.find(
      item => item.attributeId === Number(attributeId)
    );
  }

  private getNewEventConditionForm(isAssociatedEventCondition: boolean = false): CustomFormGroup<EventCondition> {
    return this.formBuilder.group({
      ...new EventCondition(Utils.generateId(), isAssociatedEventCondition),
      criteriaValues: this.formBuilder.group(new CriteriaValues()),
      dependentEventConditions: this.formBuilder.array([])
    });
  }

  private add(conditionDetails: EventCondition) {
    this.event.eventDetails = this.event.eventDetails || [];

    if (
      this.event.eventDetails.some(
        d => d.uId === conditionDetails.uId
      )
    ) {
      this.delete(conditionDetails);
    }

    this.eventService.prepareEventConditionPayload(conditionDetails);

    this.event.eventDetails.push(conditionDetails);
  }

  private edit(conditionDetails: EventCondition) {
    const formIndex = this.event.eventDetails.findIndex(
      con => con.uId === conditionDetails.uId
    );

    if (formIndex > -1) {
      this.eventService.prepareEventConditionPayload(conditionDetails);

      this.event.eventDetails.splice(formIndex, 1, conditionDetails);
    }
  }

  private delete(conditionDetails: EventCondition) {
    const deletableConditions: EventCondition[] = [conditionDetails];

    if (!!conditionDetails.compoundField) {
      const requiredAttributeIds: number[] = (conditionDetails.requiredAttributeIds || EMPTY)
        .split(COMMA).map(id => Number(id));

      if (Utils.isNotNull(requiredAttributeIds)) {
        const requiredConditions: EventCondition[] = this.event.eventDetails.filter(de => requiredAttributeIds.some(id => id === de.eventAttributeId))

        deletableConditions.push(...requiredConditions);
      }
    }

    deletableConditions.map(delCon => {
      const formIndex = this.event.eventDetails.findIndex(
        con => con.uId === delCon.uId
      );

      if (formIndex > -1) {
        this.event.eventDetails.splice(formIndex, 1);
      }
    });


  }

  private handleAssociatedAttribute(selectedAttribute: EventAttribute, eventConditionForm: CustomFormGroup<EventCondition>) {
    const formArray: UntypedFormArray = eventConditionForm.controls.dependentEventConditions as UntypedFormArray;

    if (
      Utils.isNotNull(selectedAttribute?.requiredAttributeIds) &&
      this.event.eventDetails.every(dt => !selectedAttribute?.requiredAttributeIds?.split(COMMA).includes(dt.eventAttributeId?.toString()!))
    ) {
      const dependentEventConditionForm = this.getNewEventConditionForm(true);

      formArray.controls = [];

      if (!!selectedAttribute.multipleRequireIDsORs) {
        const attributeIds: number[] = selectedAttribute.requiredAttributeIds?.split(COMMA).map(id => Number(id))!;

        if (Utils.isNotNull(attributeIds)) {
          const requiredAttributes = this.attributes.filter(at => attributeIds.some(id => id === at.attributeId));

          dependentEventConditionForm.controls?.attributeGroups?.patchValue(this.eventService.getEventAttributesGroupBySubCategory(requiredAttributes));
          dependentEventConditionForm.controls?.disabledAttribute?.patchValue(false);
        }

        formArray.push(dependentEventConditionForm);
        formArray.updateValueAndValidity();
      } else if (!!selectedAttribute.compoundField || Utils.isNotNull(selectedAttribute?.requiredAttributeIds)) {
        const associatedAttribute: EventAttribute = selectedAttribute.associatedAttribute
          || this.getAttributeById(selectedAttribute.requiredAttributeIds);

        if (!!associatedAttribute) {
          this.setUiRelatedData(dependentEventConditionForm, associatedAttribute);

          dependentEventConditionForm.controls?.attributeGroups?.patchValue(this.eventService.getEventAttributesGroupBySubCategory([associatedAttribute]));
        }

        dependentEventConditionForm.controls.eventAttributeId.patchValue(Number(selectedAttribute.requiredAttributeIds));
        dependentEventConditionForm.controls?.disabledAttribute?.patchValue(true);

        formArray.push(dependentEventConditionForm);
        formArray.updateValueAndValidity();
      }
    } else {
      formArray.clear();
    }
  }

  private setUiRelatedData(
    eventConditionForm: CustomFormGroup<EventCondition>,
    selectedAttribute: EventAttribute,
    isAssociatedEventCondition: boolean = false
  ) {
    eventConditionForm.controls.selectedAttribute?.patchValue(selectedAttribute, { emitEvent: false });

    eventConditionForm.controls.attributeOperators?.patchValue(selectedAttribute.operators, { emitEvent: false });

    eventConditionForm.controls.attributeDisplayName?.patchValue(selectedAttribute.attributeDisplayName, { emitEvent: false });

    if (isAssociatedEventCondition) {
      eventConditionForm.controls?.attributeGroups?.patchValue(this.eventService.getEventAttributesGroupBySubCategory([selectedAttribute]));
    }


    if (
      (this.action !== EventConditionAction.DELETE) &&
      selectedAttribute?.isApiAttributeType &&
      !(this.isTemplateEvent && (selectedAttribute?.attributeDisplayName === SpecialAttribute.MERCHANT_GROUP_NAME)) &&
      (SpecialAttribute.Previously_Completed_Events !== selectedAttribute.attributeDisplayName) // VLS-380
    ) {
      this.setAttributeComparisonValues(
        selectedAttribute,
        eventConditionForm
      );
    }
  }


  private addCompletedEvents(response: any[], eventCriteriaFromGroup: UntypedFormGroup) {
    if (Utils.isNotNull(response)) {
      const criteriaValues: any[] = eventCriteriaFromGroup.get("criteriaValues")?.value || [];

      const requiredValues = criteriaValues.filter(val => !response.some(item => item.id === val.id));

      requiredValues.push(...response);

      eventCriteriaFromGroup.get("criteriaValues")?.patchValue(requiredValues);
    }
  }

  private validateDetails(): boolean {
    let isValid = false;

    if (this.action === EventConditionAction.ADD) {
      const eventDetails = this.event.eventDetails || [];
      const isAlreadyConfigured = eventDetails.some(detail => {
        return (
          String(detail.eventAttributeId) ===
          String(this.eventCondition.eventAttributeId) &&
          detail.uId !== this.eventCondition.uId
        );
      });

      if (isAlreadyConfigured) {
        this.alertService.showError(`${this.eventCondition.attributeDisplayName} is already configured.`);
      } else {
        isValid = true;
      }
    } else {
      isValid = true;
    }

    return isValid;
  }

  public validate(): boolean {
    if (this.action === EventConditionAction.DELETE) {
      return true;
    }

    const formValidationFormMap = this.getFormValidationMap();
    const controls: AbstractControl[] = [];

    formValidationFormMap.forEach((formValidationMap, criteriaForm) => {
      const formControlNames = Array.from(formValidationMap.keys());

      formControlNames.map(name => {
        const control = criteriaForm.get(name);
        if (control) {
          control?.setValidators(formValidationMap.get(name) ?? []);
          control?.markAsTouched();
          control?.updateValueAndValidity({ emitEvent: false });
          controls.push(control);
        }
      });
    });

    if (controls.reduce((acc, val) => acc && !val.invalid, true)) {
      return this.validateDetails();
    } else {
      this.alertService.showError();
    }

    return false;
  }

  private clearFormValidations() {
    this.formService.clearFormControlValidators(this.eventConditionForm);
  }

  private getFormValidationMap(): Map<UntypedFormGroup, Map<string, ValidatorFn | Array<ValidatorFn> | null>> {
    const formValidationFormMap = new Map<UntypedFormGroup, Map<string, ValidatorFn | Array<ValidatorFn> | null>>();

    const dependentEventConditionForms: UntypedFormGroup[] =
      this.creatingByEventGroupTemplate ? [] : this.getDependentEventConditionFormGroups(this.eventConditionForm, true);

    const eventConditionForms: UntypedFormGroup[] = [
      this.eventConditionForm,
      ...dependentEventConditionForms
    ];

    for (const form of eventConditionForms) {
      const conditionCriteriaFormValidationMap = new Map<
        string,
        ValidatorFn | Array<ValidatorFn> | null
      >();

      const conditionFormValidationMap = new Map<
        string,
        ValidatorFn | Array<ValidatorFn> | null
      >();

      const eventCondition = form.getRawValue() as EventCondition;

      const validateSecondCriteriaValue = eventCondition.eventRuleOperator === EventAttributeOperatorType.BETWEEN;

      const validateDecimalNumber = !eventCondition.selectedAttribute?.isApiAttributeType &&
        eventCondition.selectedAttribute?.attributeType ===
        EventAttributeType.DECIMAL;

      const validateDate = !eventCondition.selectedAttribute?.isApiAttributeType &&
        eventCondition.selectedAttribute?.attributeType ===
        EventAttributeType.DECIMAL

      const validateMultiselectValues = eventCondition.selectedAttribute?.multiSelect &&
        eventCondition.selectedAttribute?.isApiAttributeType;

      const validateSingleSelectValues = eventCondition.selectedAttribute?.singleSelect &&
        eventCondition.selectedAttribute?.isApiAttributeType;

      conditionFormValidationMap.set(
        'eventAttributeId',
        [Validators.required]
      );

      conditionFormValidationMap.set(
        'eventRuleOperator',
        [Validators.required]
      );

      conditionCriteriaFormValidationMap.set(
        'singleCriteriaValue1',
        !validateSingleSelectValues && !validateMultiselectValues
          ? [Validators.required, ...(validateDecimalNumber ? [Validators.pattern(NUMBER_PATTERN)] : [])]
          : null
      );

      conditionCriteriaFormValidationMap.set(
        'singleCriteriaValue2',
        validateSecondCriteriaValue && !validateSingleSelectValues && !validateMultiselectValues
          ? [Validators.required, ...(validateDecimalNumber ? [Validators.pattern(NUMBER_PATTERN)] : [])]
          : null
      );


      conditionCriteriaFormValidationMap.set(
        'singleSelectComparisonValueId',
        validateSingleSelectValues ?
          !(
            this.isTemplateEvent &&
            eventCondition.selectedAttribute
              ?.attributeDisplayName === SpecialAttribute.MERCHANT_GROUP_NAME
          )
            ? [Validators.required]
            : null
          : null
      );

      conditionCriteriaFormValidationMap.set(
        'criteriaValues',
        validateMultiselectValues ?
          !(
            this.isTemplateEvent &&
            eventCondition.selectedAttribute
              ?.attributeDisplayName === SpecialAttribute.MERCHANT_GROUP_NAME
          )
            ? [Validators.required]
            : null
          : null
      );

      formValidationFormMap.set(
        form.get("criteriaValues") as UntypedFormGroup,
        conditionCriteriaFormValidationMap
      );

      formValidationFormMap.set(
        form as UntypedFormGroup,
        conditionFormValidationMap
      );
    }

    return formValidationFormMap;
  }

  private setErrorMessages(response: PaginationResponse<Event>) {
    this.alertService.showResponseErrors(response.errors);

    this.eventService.updateErrorMessages(response.errors, this.eventFormGroup);
  }

  ngOnInit(): void {
    this.init();
  }

  ngAfterViewInit(): void {
    this.formService.clearFormControlValidators(this.eventConditionForm);
  }

  onAttributeChange(event: any, eventConditionForm: CustomFormGroup<EventCondition>) {
    this.clearFormValidations();

    const selectedAttribute = this.getAttributeById(event?.target?.value);

    this.resetValues(eventConditionForm);

    if (selectedAttribute) {
      eventConditionForm.controls.eventRuleOperator.reset();

      setTimeout(() => {
        this.setUiRelatedData(eventConditionForm, selectedAttribute);
      }, 10);

      this.handleAssociatedAttribute(selectedAttribute, eventConditionForm);
    }
  }

  resetValues(eventConditionForm: UntypedFormGroup, resetCriteriaValuesOnly = false) {
    const criteriaForm = eventConditionForm.get('criteriaValues') as UntypedFormGroup;

    criteriaForm.reset();
    criteriaForm.get('criteriaValues')?.reset();
    criteriaForm.get('criteriaValues')?.setErrors(null);
    // criteriaForm.get('singleSelectComparisonValueId')?.setErrors(null);

    if (!resetCriteriaValuesOnly) {
      eventConditionForm.get('attributeOperators')?.reset();

      eventConditionForm.get('eventRuleOperator')?.reset();
      eventConditionForm.get('selectedAttribute')?.reset();
      eventConditionForm.get('attributeComparisonValues')?.reset();

      eventConditionForm.markAsPristine();
    }
  }

  onOperatorChange(event: any, eventConditionForm: UntypedFormGroup) {
    const value = event?.target?.value;
    const eventRuleOperatorLocked = eventConditionForm.controls['eventRuleOperatorLocked']?.value;

    if (
      (this.eventCondition?.selectedAttribute?.attributeType !== EventAttributeType.TIME) &&
      (this.eventCondition?.selectedAttribute?.attributeName !== this.SpecialAttribute.Previously_Completed_Events) &&
      (eventRuleOperatorLocked !== false)
    ) {
      this.resetValues(eventConditionForm, true);
    }


    if (value) {
      if (
        this.eventCondition?.selectedAttribute?.attributeType ===
        EventAttributeType.TIME
      ) {
        const criteriaForm = eventConditionForm.get(
          'criteriaValues'
        ) as UntypedFormGroup;
      }
    }
  }

  submitHandler() {
    if (this.validate()) {
      let callback;

      const dependentEventConditionForms: UntypedFormGroup[] = this.getDependentEventConditionFormGroups(this.eventConditionForm, true);

      const eventConditionForms: UntypedFormGroup[] = [
        this.eventConditionForm,
        ...dependentEventConditionForms
      ];

      eventConditionForms.forEach(form => {
        const conditionDetails = form.getRawValue() as EventCondition;

        if (this.action === EventConditionAction.ADD) {
          this.add(conditionDetails);
        } else if (this.action === EventConditionAction.EDIT) {
          this.edit(conditionDetails);
        } else {
          this.delete(conditionDetails);
        }
      });

      if (this.eventDialogMode === DialogMode.CREATE) {
        callback = this.isTemplateEvent ?
          this.eventService.createEventTemplate(this.event) :
          this.eventService.createEvent(this.event);
      } else {
        callback = this.isTemplateEvent
          ? this.eventService.updateEventTemplate(this.event.eventTemplateId, this.event)
          : this.eventService.updateEvent(
            this.event.eventStageId,
            this.event
          );
      }

      if (!this.creatingByEventGroupTemplate) {
        callback.subscribe({
          next: response => {
            if ((response.statusCode === SUCCESS_CODE) && Utils.isNull(response.errors)) {
              this.onSubmitEmitter.emit(response.data);
            } else {
              this.setErrorMessages(response);
            }
          },
          error: err => {
            console.log(err);
          }
        });
      } else {
        const formArray = this.eventFormGroup.get('eventDetails') as UntypedFormArray;

        formArray.patchValue(this.event.eventDetails);

        this.onSubmitEmitter.emit(null);
      }
    }
  }

  cancel() {
    this.onSubmitEmitter.emit(null);
  }

  getTimeZone() {
    return DateUtils.getTimeZone();
  }

  getErrorMessage(form: UntypedFormGroup, controlName: string): string {
    return this.eventService.getErrorMessage(form, controlName);
  }

  deleteSelectedCompletedEvent(selectedEvent: any, eventConditionForm: UntypedFormGroup) {
    const eventCriteriaFromGroup = eventConditionForm.get("criteriaValues") as UntypedFormGroup;

    const criteriaValues: any[] = eventCriteriaFromGroup.get("criteriaValues")?.value || [];

    const requiredValues = criteriaValues.filter(val => selectedEvent.id !== val.id);


    eventCriteriaFromGroup.get("criteriaValues")?.patchValue(requiredValues);
  }

  openEventSelectorDialog(selectedAttribute: EventAttribute, eventConditionForm: UntypedFormGroup) {
    console.log(eventConditionForm);
    const eventCriteriaFromGroup = eventConditionForm.get("criteriaValues") as UntypedFormGroup;

    this.dialog.open(
      CompletedEventSelectorDialogComponent,
      {
        disableClose: true,
        hasBackdrop: true,
        width: '1250px',
        ariaLabel: 'event-selector-dialog',
        data: {
          selectedAttribute: selectedAttribute,
          communityCode: this.event.communityCode
        }
      }
    ).afterClosed().pipe(takeUntil(this.destroy$))
      .subscribe(response => {
        this.addCompletedEvents(response, eventCriteriaFromGroup);
      });
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
