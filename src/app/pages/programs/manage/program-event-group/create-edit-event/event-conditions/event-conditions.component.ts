import { HttpStatusCode } from '@angular/common/http';
import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ButtonColor, ButtonIconType, CALENDAR_PLACEMENT } from '@visa/vds-angular';
import { cloneDeep } from 'lodash';
import { Observable, Subject, forkJoin } from 'rxjs';
import { distinctUntilChanged, map, takeUntil } from 'rxjs/operators';
import { COMMA, DateTimeFormat, SUCCESS_CODE, VisaIcon } from 'src/app/core/constants';
import { Mode } from 'src/app/core/models/mode.model';
import { EventTemplate } from 'src/app/pages/event-group-template/event-group-template.model';
import { AttributeCategory, EVENT_SECTION_ATTRIBUTE_CATEGORY, Event, EventAttribute, EventAttributeOperatorType, EventAttributeType, EventCondition, EventConditionAction, EventConditionSection, EventType, SpecialAttribute } from 'src/app/pages/programs/event.model';
import { DialogMode } from 'src/app/pages/programs/program.model';
import { EventGroupService } from 'src/app/services/program/event-group/event-group.service';
import { AttributeService } from 'src/app/services/program/event/attribute/attribute.service';
import { EventService } from 'src/app/services/program/event/event.service';
import { ToggleAlertService } from 'src/app/services/toggle-alert/toggle-alert.service';
import { Utils } from 'src/app/services/utils';

@Component({
  selector: 'app-event-conditions',
  templateUrl: './event-conditions.component.html',
  styleUrls: ['./event-conditions.component.scss']
})
export class EventConditionsComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input()
  form!: UntypedFormGroup;

  @Input()
  eventDialogMode!: DialogMode;

  @Input()
  disabled: boolean = false;

  @Input()
  isTemplateEvent = false;

  @Input()
  creatingByEventGroupTemplate = false;

  @Output()
  submitEmitter: EventEmitter<any> = new EventEmitter();

  private destroy$ = new Subject<void>();

  ButtonIconType = ButtonIconType;
  EventAttributeType = EventAttributeType;
  DateFormat = DateTimeFormat;
  EventAttributeOperatorType = EventAttributeOperatorType;
  AttributeCategory = AttributeCategory;
  EventConditionAction = EventConditionAction;
  CALENDAR_PLACEMENT = CALENDAR_PLACEMENT;
  ButtonColor = ButtonColor;
  Mode = Mode;
  DialogMode = DialogMode;
  VisaIcon = VisaIcon;


  initializeEventAttributes: boolean = false;
  showCreateConditionSection: boolean = false;

  selectedEventCondition!: EventCondition | null;
  selectedEvent!: EventTemplate;
  attributeCategory!: AttributeCategory;

  eventConditionAction: EventConditionAction = EventConditionAction.ADD;


  existingEventConditions: EventCondition[] = [];
  existingSegmentationConditions: EventCondition[] = [];
  eventAttributes: EventAttribute[] = [];
  eventAttributeGroups: any[] = [];
  segmentAttributes: EventAttribute[] = [];
  segmentAttributeGroups: any[] = [];
  eventConditionSections: EventConditionSection[] = [];


  get event(): Event {
    return this.form.getRawValue() as Event;
  }

  eventTypeId!: number;
  clearingSettlementType: any;
  isLoading: boolean = false;

  constructor(
    private eventGroupService: EventGroupService,
    private eventService: EventService,
    private attributeService: AttributeService,
    private alertService: ToggleAlertService,
    private route: ActivatedRoute
  ) { }

  private mapAttributesByCategory(attributeCategory: AttributeCategory | string)
    : Observable<void> {
    return this.attributeService.getAttributes({ eventAttrCategory: attributeCategory })
      .pipe(map(response => {
        if (Utils.isNull(response.errors) && (response.statusCode === HttpStatusCode.Ok)) {
          const attributes = response.data || [];
          const requiredAttributeForCompoundField =
            attributes.find(att => !!att.compoundField && !!att.associatedAttribute && this.event?.eventDetails?.some(evD => evD.eventAttributeId === att.attributeId))?.associatedAttribute;

          if (!!requiredAttributeForCompoundField) {
            attributes.push(requiredAttributeForCompoundField);
          }

          if (attributeCategory === AttributeCategory.EVENT) {
            this.eventAttributes = attributes;
            const categorizedEventAttributeGroups: any = this.eventService.getEventAttributesGroupBySubCategory(this.eventAttributes);
            this.eventAttributeGroups = this.eventService.filterAttributesBasedOnEventType(categorizedEventAttributeGroups, this.eventTypeId, this.clearingSettlementType);
          }
          if (attributeCategory === AttributeCategory.TARGETING) {
            this.segmentAttributes = attributes;
            this.segmentAttributeGroups = this.eventService.getEventAttributesGroupBySubCategory(this.segmentAttributes);
          }
        } else {
          this.alertService.showResponseErrors(response.errors);
        }
      }));
  }

  private setAttributes(eventConditionSections: EventConditionSection[]) {
    if (!this.creatingByEventGroupTemplate) {
      this.initializeEventAttributes = false;

      if (Utils.isNotNull(eventConditionSections)) {
        forkJoin(eventConditionSections.map(sec => {
          const attCategory: AttributeCategory | string = EVENT_SECTION_ATTRIBUTE_CATEGORY[sec.uiSectionName];

          if (!!attCategory) {
            return this.mapAttributesByCategory(attCategory);
          } else {
            return undefined;
          }
        }).filter(val => !!val)
        ).subscribe(res => this.initializeEventAttributes = true);
      }
    }
  }

  private setEventSections(eventTypeId: number) {
    this.eventTypeId = eventTypeId;
    this.eventService.getEventSections(eventTypeId)
      .pipe(takeUntil(this.destroy$)).subscribe(response => {
        if (Utils.isNull(response.errors) && (response.statusCode === SUCCESS_CODE)) {
          this.form.get('eventConditionSections')?.patchValue(response.data);
        } else {
          this.alertService.showResponseErrors(response.errors);
        }
      });
  }

  private registerOnChangeListeners() {
    this.form.get('eventTypeId')?.valueChanges
      .pipe(distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(
        value => {
          if (value === EventType.Cleared) {
            if (this.route.snapshot.queryParams['client']) {
              const params = { communityCode: this.route.snapshot.queryParams['client'] };
              this.isLoading = true;
              this.eventService.getClearingSettlementType(params).subscribe({
                next: (res: any) => {
                  res = JSON.parse(res.body);
                  if (res && res.data) {
                    this.clearingSettlementType = res.data;
                    this.setEventSections(value);
                  }
                  this.isLoading = false;
                },
                error: (err: any) => {
                  this.isLoading = false;
                  this.alertService.showResponseErrors(err);
                }
              })
            }
          } else {
            this.setEventSections(value);
          }
        }
      );

    this.form.get('eventConditionSections')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        value => this.setAttributes(value)
      );
  }

  private init() {
    if (this.eventDialogMode !== DialogMode.CREATE) {
      this.form.get('eventTypeId')?.updateValueAndValidity();
    }

    this.setExistingConditions();
  }

  private setExistingConditions() {
    const eventDetails = this.form.getRawValue() as Event;

    const eventConditions = eventDetails?.eventDetails;
    if (Utils.isNotNull(eventConditions)) {
      eventConditions.map(condition => {
        if (condition.attributeCategory === AttributeCategory.EVENT) {
          this.existingEventConditions.push(condition);
        }
        if (condition.attributeCategory === AttributeCategory.TARGETING) {
          this.existingSegmentationConditions.push(condition);
        }
      });
    }
  }


  ngAfterViewInit(): void {
    this.registerOnChangeListeners();
    this.init();
  }

  ngOnInit(): void { }


  showDeleteAction(eventCondition: EventCondition, existingConditions: EventCondition[]): boolean {
    if (Utils.isNotNull(existingConditions)) {
      const specialEventCondition = existingConditions.find(con => con.attributeDisplayName === SpecialAttribute.USER_AGGREGATE_PERIOD_DAYS);
      const hideDeleteForSpecialConditions: boolean = !!specialEventCondition &&
        !specialEventCondition.requiredAttributeIds!.split(COMMA).every(id => existingConditions.some(con => con.eventAttributeId?.toString() === id)) &&
        specialEventCondition?.requiredAttributeIds!.split(COMMA).includes(eventCondition.eventAttributeId?.toString()!);

      return (existingConditions.length === 1) ||
        !existingConditions.some(existingCon => {
          return (
            ((existingCon.id !== eventCondition.id) || (existingCon.uId !== eventCondition.uId)) &&
            ((existingCon.requiredAttributeIds === eventCondition.eventAttributeId?.toString()) || hideDeleteForSpecialConditions)
          );
        });

      // return (existingConditions.length === 1)
    }

    return true;
  }

  handleSubmit(eventDetails: any) {
    if (eventDetails) {
      this.submitEmitter.emit(eventDetails);
    }
    this.showCreateConditionSection = false;

    this.selectedEventCondition = null;
  }

  selectEventConditionConfigs(condition: EventCondition, action: EventConditionAction) {
    if (condition.attributeCategory) {
      this.attributeCategory = condition.attributeCategory;
    }
    this.eventConditionAction = action;

    this.setSelectedEvent();

    this.selectedEventCondition = condition;
  }

  getConditions(category: AttributeCategory): EventCondition[] {
    const eventDetails: EventCondition[] = this.form.get('eventDetails')?.value || [];

    return eventDetails.filter(item => item.attributeCategory === category);
  }

  getComparisonValues(condition: EventCondition): string {
    return this.eventGroupService.getComparisonValues(condition);
  }

  handleAddCondition(category: AttributeCategory) {
    this.eventConditionAction = EventConditionAction.ADD;

    this.attributeCategory = category;

    this.selectedEventCondition = null;

    this.setSelectedEvent();

    this.showCreateConditionSection = true;
  }

  setSelectedEvent() {
    const event = this.form.getRawValue() as EventTemplate;

    this.selectedEvent = cloneDeep(event);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
