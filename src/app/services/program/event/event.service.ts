import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UntypedFormGroup, ValidationErrors } from '@angular/forms';
import { cloneDeep } from 'lodash';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { COMMA, DateTimeFormat, EMPTY, INVALID_ENTRY, WorkFlowAction } from 'src/app/core/constants';
import { PaginationResponse, ResponseError } from 'src/app/core/models/pagination-response.model';
import { EventTemplate } from 'src/app/pages/event-group-template/event-group-template.model';
import { EventGroup, EventGroupStep } from 'src/app/pages/programs/event-group.model';
import { ALLOWED_EVENT_TYPE_ID_GROUP_ATTRIBUTES, CLEARING_ATTRIBUTES_MAPPING, CriteriaValues, Event, EventAttribute, EventAttributeOperatorType, EventAttributeType, EventCondition, EventConditionSection, EventType, RecurrenceLimit, SpecialAttribute } from 'src/app/pages/programs/event.model';
import {
  DialogMode
} from 'src/app/pages/programs/program.model';
import { CommentModel } from 'src/app/shared/comments-modal/comments-modal.model';
import { FormService } from '../../form-service/form.service';
import { DateUtils } from '../../util/dateUtils';
import { Utils } from '../../utils';
import { EventActionService } from '../event-action/event-action.service';
import { ApiConfigService } from '../../api-config.service';
import { HttpService } from '../../http/http.service';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private readonly URL_CONFIG = {
    base: `${this.env.getUrls().baseUrl}api/v1/event/`,
    CRUDOperations: 'event',
    eventTemplate: 'template',
    eventMessage: 'eventMessage',
    statusToInActive: 'statusToInActive',
    statusToPendingDeactivation: 'statusToPendingDeactivation',
    statusToDeactivationRejected: 'statusToDeactivationRejected',
    listEventMessages: 'listEventMessages',
    listReUsableEvents: 'listReUsableEvents',
    statementCreditEvents: 'statementCreditEvents'
  };

  private errorMessages = {
    default: {
      invalid: INVALID_ENTRY,
      pattern: 'Value must be number.',
      required: 'This is a required field.'
    },
    // criteriaValues: {
    //   required: 'Invalid Entry.'
    // },
    eventName: {
      required: 'Please fill out the Event Name field.'
    },
    eventTypeId: {
      required: 'Please select an option.',

    },
    recurrenceLimit: {
      required: 'Please select an option.'
    },
    eventStartDate: {
      required: 'Start Date is required.',
      startDateError: 'Start Date must be greater than present date.',
      eventDateRangeError: 'Event Start Date must be within the Event Group Start Date and End Date.'
    },
    eventEndDate: {
      required: 'End Date is required.',
      dateRangeError: 'End Date must be greater than Start Date.',
      eventDateRangeError: 'Event End Date must be within the Event Group Start Date and End Date.'
    },
    occurrence: {
      pattern: 'Invalid Entry, Value must be a number.',
      rangeError: 'Value must be greater than or equal to 2.'
    }
  };

  private eventDialogConfigData: any = {};

  private reloadEvent$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  get reloadEventObservable(): Observable<boolean> {
    return this.reloadEvent$.asObservable();
  }

  constructor(
    private httpClient: HttpClient,
    private formService: FormService,
    private eventActionService: EventActionService,
    private env: ApiConfigService,
    private http: HttpService,
  ) { }

  public emitReloadEvent(reload: boolean): void {
    this.reloadEvent$.next(reload);
  }

  public setEventDialogConfigData(
    dialogMode: DialogMode,
    event: Event,
    openEventGroupDialog: boolean,
    eventGroupDialogConfigData: any,
    eventGroupDialogSelectedTab?: EventGroupStep
  ) {
    this.clearEventDialogConfigData();

    this.eventDialogConfigData = {
      dialogMode: dialogMode,
      event: event,
      openEventGroupDialog: openEventGroupDialog,
      eventGroupDialogConfigData: eventGroupDialogConfigData,
      eventGroupDialogSelectedTab: eventGroupDialogSelectedTab
    };
  }

  public getEventDialogConfigData() {
    return this.eventDialogConfigData;
  }

  public clearEventDialogConfigData() {
    this.eventActionService.clearEventActionDialogConfigData();

    this.eventDialogConfigData = {};
  }

  public getEvent(
    eventId: null | number
  ): Observable<PaginationResponse<Event>> {
    return this.httpClient
      .get<PaginationResponse<Event>>(
        `${this.URL_CONFIG.base}${this.URL_CONFIG.CRUDOperations}/${eventId}`
      )
      .pipe(map(response => this.parseResponse(response)));
  }

  public createEvent(event: Event): Observable<PaginationResponse<Event>> {
    return this.httpClient
      .post<PaginationResponse<Event>>(
        `${this.URL_CONFIG.base}${this.URL_CONFIG.CRUDOperations}`,
        this.preparePayload(event)
      )
      .pipe(map(response => this.parseResponse(response)));
  }

  public updateEvent(
    eventId: null | number,
    event: Event
  ): Observable<PaginationResponse<Event>> {
    return this.httpClient
      .put<PaginationResponse<Event>>(
        `${this.URL_CONFIG.base}${this.URL_CONFIG.CRUDOperations}/${eventId}`,
        this.preparePayload(event)
      )
      .pipe(map(response => this.parseResponse(response)));
  }

  public getReusableEvents(communityCode: string): Observable<PaginationResponse<Event[]>> {
    const params = {
      communityCode: communityCode,
      page: 0,
      size: 50,
      sort: 'eventName,asc'
    };

    return this.httpClient.get<PaginationResponse<Event[]>>(
      `${this.URL_CONFIG.base}${this.URL_CONFIG.listReUsableEvents}`,
      { params }
    );
  }

  public deactivateEvent(
    eventGroup: EventGroup,
    eventId: null | number,
    comment: string,
    workflowAction: WorkFlowAction.DEACTIVATE | WorkFlowAction.SUBMIT_FOR_DEACTIVATE | WorkFlowAction.REJECT_DEACTIVATION | WorkFlowAction.APPROVE_DEACTIVATION
  ): Observable<PaginationResponse<EventGroup>> {
    const params: any = {
      communityCode: eventGroup.communityCode,
      comment: comment,
      versionNumber: eventGroup.versionNumber,
      workflowVersionNumber: eventGroup.workflowVersionNumber
    }

    let endpoint: string = EMPTY;

    if (((workflowAction === WorkFlowAction.DEACTIVATE) || (workflowAction === WorkFlowAction.APPROVE_DEACTIVATION))) {
      endpoint = this.URL_CONFIG.statusToInActive;
    } else if (workflowAction === WorkFlowAction.SUBMIT_FOR_DEACTIVATE) {
      endpoint = this.URL_CONFIG.statusToPendingDeactivation;
    } else if (workflowAction === WorkFlowAction.REJECT_DEACTIVATION) {
      endpoint = this.URL_CONFIG.statusToDeactivationRejected;
    }

    return this.httpClient.put<PaginationResponse<EventGroup>>(
      `${this.URL_CONFIG.base}${endpoint}/${eventId}`,
      { ...params }
    );
  }

  public getEventSections(eventTypeId: number): Observable<PaginationResponse<EventConditionSection[]>> {
    return this.httpClient.get<PaginationResponse<any[]>>(`${this.env.getUrls().baseUrl}api/v1/eventType/getEventSections/${eventTypeId}`);
  }

  public getStatementCreditEvents(params: any): Observable<PaginationResponse<any[]>> {
    return this.httpClient.get<PaginationResponse<any[]>>(`${this.URL_CONFIG.base}${this.URL_CONFIG.statementCreditEvents}`, { params });
  }

  public updateErrorMessages(responseErrors: ResponseError[], form: UntypedFormGroup) {
    const additionalErrors = this.formService.prepareErrorObject(responseErrors);

    this.errorMessages = { ...this.errorMessages, ...additionalErrors };

    this.formService.setResponseErrors(responseErrors, form);
  }

  public getErrorMessage(form: UntypedFormGroup, fromControlName: string): string {
    return this.formService.getFormControlErrorMessage(
      form,
      fromControlName,
      this.errorMessages
    );
  }

  public occurrenceRangeValidator(value: number): ValidationErrors | null {
    let isValid = true;


    if (value) {
      if (value < 2) { isValid = false }

      if (!isValid) {
        return { rangeError: true }
      }
    }

    return null;
  }


  private parseAssociatedConditions(eventConditions: EventCondition[]) {
    const associatedEventConditionMapper: Function = (condition: EventCondition) => {
      if (Utils.isNotNull(condition.requiredAttributeIds) && !!condition.compoundField) {
        condition.dependentEventConditions = [];
        const requiredIds: number[] = (condition.requiredAttributeIds || EMPTY).split(COMMA).map(id => Number(id));

        for (const attId of requiredIds) {
          const associatedEventCondition = eventConditions.find(con => con.eventAttributeId === attId)!;

          if (!!associatedEventCondition) {
            associatedEventCondition.isAssociatedEventCondition = true;

            associatedEventConditionMapper(associatedEventCondition);

            condition.dependentEventConditions.push(associatedEventCondition);
          }
        }
      }
    };

    eventConditions.forEach(condition => {
      associatedEventConditionMapper(condition);
    });
  }


  public parseResponse(
    eventResponse: PaginationResponse<Event>
  ): PaginationResponse<Event> {
    const event = eventResponse.data;

    if (event) {
      if (event.eventStartDate) {
        const startDate = DateUtils.convertUTCDateTimeToLocalDateTime(
          event.eventStartDate
        );

        event.eventStartDate = startDate;
        event.startTime = DateUtils.formatDateTime(startDate, DateTimeFormat.HH_MM_SS);
      }

      if (event.eventEndDate) {
        const endDate = DateUtils.convertUTCDateTimeToLocalDateTime(
          event.eventEndDate
        );

        event.eventEndDate = endDate;
        event.endTime = DateUtils.formatDateTime(endDate, DateTimeFormat.HH_MM_SS);
      }

      if (event.recurrenceLimit) {
        if (event.recurrenceLimit >= RecurrenceLimit.UpTo) {
          event.occurrence = event.recurrenceLimit;
        }
      }

      const eventConditions = event?.eventDetails;

      if (Utils.isNotNull(eventConditions)) {
        eventConditions.map(condition => {
          condition.uId = String(condition.id);

          if (condition.criteriaValues) {
            if (condition.attributeType === EventAttributeType.DATE) {
              if ((condition.attributeDisplayName === SpecialAttribute.DATE_ENROLLED) ||
                (condition.attributeDisplayName === SpecialAttribute.PURCHASE_DATE)) {

                condition.criteriaValues.singleCriteriaValue1 = DateUtils.formatDateTime(
                  condition.criteriaValues?.singleCriteriaValue1 || EMPTY,
                  DateTimeFormat.MOMENT_YYYY_MM_DD
                );
                condition.criteriaValues.singleCriteriaValue2 = DateUtils.formatDateTime(
                  condition.criteriaValues?.singleCriteriaValue2 || EMPTY,
                  DateTimeFormat.MOMENT_YYYY_MM_DD
                );
              } else {
                condition.criteriaValues.singleCriteriaValue1 = DateUtils.convertUTCDateTimeToLocalDateTime(
                  condition.criteriaValues?.singleCriteriaValue1 || EMPTY,
                  DateTimeFormat.MOMENT_MM_DD_YYYY_HH_MM_A
                );
                condition.criteriaValues.singleCriteriaValue2 = DateUtils.convertUTCDateTimeToLocalDateTime(
                  condition.criteriaValues?.singleCriteriaValue2 || EMPTY,
                  DateTimeFormat.MOMENT_MM_DD_YYYY_HH_MM_A
                );
              }

            }

            if (condition.attributeType === EventAttributeType.TIME) {
              if (condition.attributeDisplayName !== SpecialAttribute.BETWEEN_GMT_TIME) {
                condition.criteriaValues.singleCriteriaValue1 = DateUtils.convertUTCDateTimeToLocalDateTime(
                  condition.criteriaValues?.singleCriteriaValue1 || EMPTY,
                  DateTimeFormat.HH_MM_SS
                );
                condition.criteriaValues.singleCriteriaValue2 = DateUtils.convertUTCDateTimeToLocalDateTime(
                  condition.criteriaValues?.singleCriteriaValue2 || EMPTY,
                  DateTimeFormat.HH_MM_SS
                );
              }
            }

            if (condition?.criteriaValues?.criteriaValues) {
              condition.criteriaValues.criteriaValues = condition.criteriaValues.criteriaValues.map(item =>
              ({
                id: item.id,
                label: item.label
              })
              );


              if (![
                EventAttributeOperatorType.IS_IN_LIST.toString(),
                EventAttributeOperatorType.IS_NOT_IN_LIST.toString()].includes(condition.eventRuleOperator!) &&
                (condition.criteriaValues.criteriaValues.length === 1) &&
                condition.criteriaValues.criteriaValues[0].id !== condition.criteriaValues.criteriaValues[0].label
              ) {
                condition.criteriaValues.singleSelectComparisonValueId = String(condition.criteriaValues.criteriaValues[0].id);
                condition.criteriaValues.singleSelectComparisonValueLabel = String(condition.criteriaValues.criteriaValues[0].label);
              } else {
                if (condition.criteriaValues.criteriaValues.length === 1 && condition.criteriaValues.criteriaValues[0].id === condition.criteriaValues.criteriaValues[0].label) {
                  condition.criteriaValues.singleCriteriaValue1 = condition.criteriaValues.criteriaValues[0].label;
                }
              }
            }
          }
        });

        // this.parseAssociatedConditions(eventConditions);
      }
    }

    return eventResponse;
  }


  public prepareEventConditionPayload(eventCondition: EventCondition) {
    const operator = eventCondition.eventRuleOperator;
    const criteriaValues: CriteriaValues | null = eventCondition.criteriaValues;
    const selectedAttribute = eventCondition.selectedAttribute;

    if (criteriaValues) {
      if (selectedAttribute?.isApiAttributeType) {
        let values: any[] = [];
        if (!!criteriaValues?.singleSelectComparisonValueId) {
          criteriaValues.criteriaValues = [];
        }

        if (
          Utils.isNull(criteriaValues.criteriaValues) &&
          criteriaValues?.singleSelectComparisonValueId
        ) {
          const comparisonValues = eventCondition.attributeComparisonValues;
          const singleSelectedComparisonValue = (
            comparisonValues || []
          ).find(
            (v: any) =>
              v.value === criteriaValues?.singleSelectComparisonValueId
          );

          if (singleSelectedComparisonValue) {
            values.push({
              id: singleSelectedComparisonValue.value,
              label: singleSelectedComparisonValue.label
            });
          }
        }

        if (Utils.isNotNull(criteriaValues.criteriaValues)) {
          values = values.filter(c => String(c.id) !== String(criteriaValues?.singleSelectComparisonValueId));

          values.push(
            ...criteriaValues.criteriaValues.map(v => ({
              id: v.id,
              label: v.label
            }))
          );
        }


        criteriaValues.criteriaValues = values;
      } else {
        if (
          selectedAttribute?.attributeType === EventAttributeType.TIME
        ) {
          if (selectedAttribute?.attributeDisplayName !== SpecialAttribute.BETWEEN_GMT_TIME) {
            criteriaValues.singleCriteriaValue1 = DateUtils.convertLocalDateTimeToUTCDateTime(
              criteriaValues.singleCriteriaValue1 || EMPTY,
              DateTimeFormat.HH_MM_SS
            );
            criteriaValues.singleCriteriaValue2 = DateUtils.convertLocalDateTimeToUTCDateTime(
              criteriaValues.singleCriteriaValue2 || EMPTY,
              DateTimeFormat.HH_MM_SS
            );
          }
        }

        if (
          selectedAttribute?.attributeType === EventAttributeType.DATE
        ) {
          if (((selectedAttribute.attributeDisplayName === SpecialAttribute.DATE_ENROLLED) ||
            (selectedAttribute.attributeDisplayName === SpecialAttribute.PURCHASE_DATE))) {

            criteriaValues.singleCriteriaValue1 = DateUtils.formatDateTime(
              criteriaValues.singleCriteriaValue1 || EMPTY,
              DateTimeFormat.MOMENT_YYYY_MM_DD
            );
            criteriaValues.singleCriteriaValue2 = DateUtils.formatDateTime(
              criteriaValues.singleCriteriaValue2 || EMPTY,
              DateTimeFormat.MOMENT_YYYY_MM_DD
            );
          } else {
            criteriaValues.singleCriteriaValue1 = DateUtils.convertLocalDateTimeToUTCDateTime(
              criteriaValues.singleCriteriaValue1 || EMPTY,
              DateTimeFormat.MOMENT_YYYY_MM_DD_TIME
            );
            criteriaValues.singleCriteriaValue2 = DateUtils.convertLocalDateTimeToUTCDateTime(
              criteriaValues.singleCriteriaValue2 || EMPTY,
              DateTimeFormat.MOMENT_YYYY_MM_DD_TIME
            );
          }
        }

        if (
          [
            EventAttributeOperatorType.IS_IN_LIST.toString(),
            EventAttributeOperatorType.IS_NOT_IN_LIST.toString()
          ].includes(operator!) &&
          !!criteriaValues.singleCriteriaValue1
        ) {
          criteriaValues.criteriaValues = [];

          criteriaValues.criteriaValues.push({
            id: criteriaValues.singleCriteriaValue1,
            label: criteriaValues.singleCriteriaValue1
          });

          criteriaValues.singleCriteriaValue1 = null
        }
      }
    }
  }


  // public openCreateEditEventDialog(
  //   mode: DialogMode,
  //   eventGroupDialogMode?: DialogMode,
  //   eventGroupDetails?: EventGroup,
  //   eventDetails?: Event | null,
  //   program?: Program,
  //   openEventGroupDialog: boolean = true,
  //   callback: Function = () => { }
  // ) {
  //   this.dialogService.close();

  //   this.dialogService.open(
  //     CreateEditEventComponent,
  //     {
  //       data: {
  //         mode: mode,
  //         eventGroupDialogMode: eventGroupDialogMode,
  //         eventGroup: eventGroupDetails,
  //         program: program,
  //         eventDetails: eventDetails,
  //         openEventGroupDialog: openEventGroupDialog,
  //         returnCallback: callback
  //       }
  //     }
  //   );
  // }

  private preparePayload(event: Event) {
    const payload = cloneDeep(event);

    if (payload) {
      payload.eventStartDate = payload.formattedStartDate;
      payload.eventEndDate = payload.formattedEndDate;

      if (payload.startTime) {
        payload.eventStartDate = `${payload.eventStartDate} ${payload.startTime}`;
        payload.eventStartDate = DateUtils.convertLocalDateTimeToUTCDateTime(
          payload.eventStartDate,
          DateTimeFormat.MOMENT_YYYY_MM_DD_TIME
        );
      }

      if (payload.endTime) {
        payload.eventEndDate = `${payload.eventEndDate} ${payload.endTime}`;
        payload.eventEndDate = DateUtils.convertLocalDateTimeToUTCDateTime(
          payload.eventEndDate,
          DateTimeFormat.MOMENT_YYYY_MM_DD_TIME
        );
      }

      if (payload.recurrenceLimit! >= RecurrenceLimit.UpTo && !!payload.occurrence) {
        payload.recurrenceLimit = payload.occurrence;
      }


      if (Utils.isNotNull(payload.eventDetails)) {
        for (const detail of payload.eventDetails) {
          const criteriaValues: CriteriaValues | null = detail.criteriaValues;

          delete criteriaValues?.singleSelectComparisonValueId;
          delete criteriaValues?.singleSelectComparisonValueLabel;


          delete detail?.uId;
          delete detail?.selectedAttribute;
          delete detail?.attributeOperators;
          delete detail?.attributeComparisonValues;
          delete detail?.dependentEventConditions;
          delete detail?.isAssociatedEventCondition;
        }
      }

      delete payload?.occurrence;
      delete payload.formattedStartDate;
      delete payload.formattedEndDate;
      delete payload.startTime;
      delete payload.endTime;
      delete payload.eventConditionSections;
    }

    return payload;
  }






  public getTemplateEvent(
    eventTemplateId: null | number
  ): Observable<PaginationResponse<EventTemplate>> {
    return this.httpClient
      .get<PaginationResponse<Event>>(
        `${this.URL_CONFIG.base}${this.URL_CONFIG.eventTemplate}/${eventTemplateId}`
      )
      .pipe(map(response => this.parseResponse(response) as PaginationResponse<EventTemplate>));
  }


  public createEventTemplate(eventTemplate: EventTemplate): Observable<PaginationResponse<EventTemplate>> {
    return this.httpClient.post<PaginationResponse<EventTemplate>>(
      `${this.URL_CONFIG.base}${this.URL_CONFIG.eventTemplate}`,
      this.preparePayload(eventTemplate));
  }

  public updateEventTemplate(eventTemplateId: null | number, eventTemplate: EventTemplate): Observable<PaginationResponse<EventTemplate>> {
    return this.httpClient.put<PaginationResponse<EventTemplate>>(
      `${this.URL_CONFIG.base}${this.URL_CONFIG.eventTemplate}/${eventTemplateId}`,
      this.preparePayload(eventTemplate)
    );
  }

  public getEventMessages(eventId: number, params: any = {}): Observable<PaginationResponse<Array<CommentModel>>> {
    return this.httpClient.get<PaginationResponse<Array<CommentModel>>>(
      `${this.env.getUrls().baseUrl}api/v1/message/${this.URL_CONFIG.listEventMessages}/${eventId}`, { params }
    );
  }

  public postEventMessage(params: any = {}): Observable<PaginationResponse<Array<CommentModel>>> {
    return this.httpClient.post<PaginationResponse<Array<CommentModel>>>(
      `${this.env.getUrls().baseUrl}api/v1/message/${this.URL_CONFIG.eventMessage}`, params
    );
  }

  public getEventAccordionViewId(event: Event): string {
    return 'event-' + event?.eventName + event?.eventStageId;
  }

  public getEventAttributesGroupBySubCategory(attributes: EventAttribute[]) {
    return attributes.reduce((r, a) => {
      r[a.attributeSubCategory] = r[a.attributeSubCategory] || [];
      r[a.attributeSubCategory].push(a);
      return r;
    }, Object.create(null));
  }

  public filterAttributesBasedOnEventType(attributeGroups: any, eventTypeId: any, clearingSettlementType?: string) {
    //Determine the allowed optgroups for the given eventTypeId
    let allowedGroups: any;
    if (ALLOWED_EVENT_TYPE_ID_GROUP_ATTRIBUTES[eventTypeId]) {
      allowedGroups = ALLOWED_EVENT_TYPE_ID_GROUP_ATTRIBUTES[eventTypeId];
    } else {
      allowedGroups = Object.keys(attributeGroups);
    }

    //Filter optgroups based on allowedGroups
    let filteredData = Object.keys(attributeGroups)
      .filter(key => allowedGroups.includes(key))
      .reduce((result: any, key: any) => {
        result[key] = attributeGroups[key];
        return result;
      }, {});

    if (eventTypeId === EventType.Cleared && clearingSettlementType) {
      const allowedAttributes = CLEARING_ATTRIBUTES_MAPPING[clearingSettlementType];
      if (allowedAttributes) {
        filteredData['Clearing'] = filteredData['Clearing'].filter((item: EventAttribute) => allowedAttributes.includes(item.attributeDisplayName))
      }
    }
    return filteredData;
  }

  public getClearingSettlementType(params: any): Observable<any> {
    return this.http.get(`api/settlementsource`, params);
  }
}
