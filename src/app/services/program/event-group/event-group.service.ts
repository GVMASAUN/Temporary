import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ButtonColor } from '@visa/vds-angular';
import { cloneDeep } from 'lodash';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { COMMA_SEPARATOR, CONFIRM_MESSAGE, DateTimeFormat, EMPTY, INVALID_ENTRY, QUESTION_MARK, WorkFlowAction } from 'src/app/core/constants';
import { DialogComponent } from 'src/app/core/dialog/dialog.component';
import { DialogConfig } from 'src/app/core/dialog/dialog.model';
import { PaginationResponse, ResponseError } from 'src/app/core/models/pagination-response.model';
import { EventGroupByTemplateDialogConfig } from 'src/app/pages/event-group-template/event-group-template.model';
import { EventGroup, EventGroupVersion } from 'src/app/pages/programs/event-group.model';
import { Event, EventActionFulfillmentMonetaryType, EventActionType, EventCondition, RecurrenceLimit, SpecialAttribute } from 'src/app/pages/programs/event.model';
import { CreateEditEventGroupByTemplateComponent } from 'src/app/pages/programs/manage/program-event-group/create-edit-event-group-by-template/create-edit-event-group-by-template.component';
import { DialogMode, Program } from 'src/app/pages/programs/program.model';
import { CommentModel } from 'src/app/shared/comments-modal/comments-modal.model';
import { SearchTableService } from 'src/app/shared/search-table/search-table.service';
import { ApiConfigService } from '../../api-config.service';
import { FormService } from '../../form-service/form.service';
import { ToggleAlertService } from '../../toggle-alert/toggle-alert.service';
import { DateUtils } from '../../util/dateUtils';
import { FunctionsService } from '../../util/functions.service';
import { Utils } from '../../utils';
import { EventService } from '../event/event.service';

@Injectable({
  providedIn: 'root'
})
export class EventGroupService {
  private readonly URL_CONFIG = {
    base: `${this.env.getUrls().baseUrl}api/v1/eventgroup/`,
    CRUDOperations: 'eventgroup',
    publishedGroup: 'publishedEventgroup',
    eventGroupMessage: 'eventGroupMessage',
    listEventGroupMessages: 'listEventGroupMessages',
    eventGroupVersions: 'eventgroupVersions',
    listEventGroups: 'listEventGroups',
    listPublishedEventGroups: 'listPublishedEventGroups',
    listReUsableEventGroups: 'listReUsableEventGroups',
    rollback: 'rollback'
  };


  private readonly sortMapping: { [key: string]: string } = {
    startDate: 'eventGroupStartDate',
    endDate: 'eventGroupEndDate'
  };

  private errorMessages = {
    default: {
      invalid: INVALID_ENTRY,
      required: 'Required'
    },
    eventGroupName: {
      required: 'Please fill out the Event Group Name field.'
    },
    eventGroupType: {
      required: 'Please select an option.'
    },
    eventGroupStartDate: {
      required: 'Start Date is required.',
      startDateError: 'Start Date must be greater than present date.'
    },
    eventGroupEndDate: {
      required: 'End Date is required',
      dateRangeError: 'End Date must be greater than Start Date'
    },
    startTime: {
      required: 'Start Time is required'
    },
    endTime: {
      required: 'End Time is required'
    },
    occurrence: {
      pattern: 'Invalid Entry, Value must be a number.',
      rangeError: 'Value must be greater than or equal to 2.'
    }
  };

  private eventGroupDialogConfigData: any = {};

  private reloadEventGroup$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  get reloadEventGroupObservable(): Observable<boolean> {
    return this.reloadEventGroup$.asObservable();
  }

  constructor(
    private httpClient: HttpClient,
    private searchTableService: SearchTableService,
    private eventService: EventService,
    private formService: FormService,
    private toggleAlertService: ToggleAlertService,
    private functionService: FunctionsService,
    private dialog: MatDialog,
    private env: ApiConfigService
  ) { }

  public emitReloadEventGroup(reload: boolean): void {
    this.reloadEventGroup$.next(reload);
  }

  public setEventGroupDialogConfigData(
    dialogMode: DialogMode, eventGroup: EventGroup, program: Program,
    selectedEventGroupVersion: EventGroupVersion | null,
    isDraftAvailable: boolean = false,
    expandEvents?: boolean,
    expandedEventIndex?: number | null,
    selectTab?: string | null
  ) {
    this.clearEventGroupDialogConfigData();

    this.eventGroupDialogConfigData = {
      dialogMode: dialogMode,
      program: program,
      eventGroup: eventGroup,
      selectedEventGroupVersion: selectedEventGroupVersion,
      isDraftAvailable: isDraftAvailable,
      expandEvents: expandEvents,
      expandedEventIndex: expandedEventIndex,
      selectTab: selectTab
    };
  }

  public getEventGroupDialogConfigData() {
    return this.eventGroupDialogConfigData;
  }

  public clearEventGroupDialogConfigData() {
    this.eventService.clearEventDialogConfigData();
    this.eventGroupDialogConfigData = {};
  }

  public updateErrorMessages(responseErrors: ResponseError[], form: UntypedFormGroup) {
    const additionalErrors = this.formService.prepareErrorObject(responseErrors);

    this.errorMessages = { ...this.errorMessages, ...additionalErrors };

    this.formService.setResponseErrors(responseErrors, form)
  }

  public getErrorMessage(form: UntypedFormGroup, fromControlName: string): string {
    return this.formService.getFormControlErrorMessage(
      form,
      fromControlName,
      this.errorMessages
    );
  }

  public getEventGroup(
    programStageId: number | null,
    eventGroupId: number | null,
    isPublishedGroupRequest: boolean = false,
    selectedWorkflowVersion?: number
  )
    : Observable<PaginationResponse<EventGroup>> {
    const params: any = {
      programStageId: programStageId
    };


    return this.httpClient.get<PaginationResponse<EventGroup>>(
      `${this.URL_CONFIG.base}${isPublishedGroupRequest ? this.URL_CONFIG.publishedGroup : this.URL_CONFIG.CRUDOperations}/${eventGroupId}${(!isPublishedGroupRequest && !!selectedWorkflowVersion) ? '/' + selectedWorkflowVersion : EMPTY}`,
      { params }
    ).pipe(map(res => this.parseResponse(res)));
  }

  public getEventGroupByVersion(
    programStageId: number | null,
    eventGroupId: number | null,
    selectedWorkflowVersionNumber: any
  )
    : Observable<PaginationResponse<EventGroup>> {
    const params: any = {
      programStageId: programStageId
    };


    return this.httpClient.get<PaginationResponse<EventGroup>>(
      `${this.URL_CONFIG.base}${this.URL_CONFIG.CRUDOperations}/${eventGroupId}/${selectedWorkflowVersionNumber}`,
      { params }
    ).pipe(map(res => this.parseResponse(res)));
  }

  public getEventGroupVersions(eventGroupId: number | null, communityCode: string)
    : Observable<PaginationResponse<Array<EventGroupVersion>>> {
    const params: any = {
      communityCode: communityCode
    };

    return this.httpClient.get<PaginationResponse<Array<EventGroupVersion>>>(
      `${this.URL_CONFIG.base}${this.URL_CONFIG.eventGroupVersions}/${eventGroupId}`,
      { params }
    )
  }

  public createEventGroup(eventGroup: EventGroup): Observable<PaginationResponse<EventGroup>> {
    return this.httpClient.post<PaginationResponse<EventGroup>>(
      `${this.URL_CONFIG.base}${this.URL_CONFIG.CRUDOperations}`,
      this.preparePayload(eventGroup));
  }

  public updateEventGroup(eventGroupId: null | number, eventGroup: EventGroup): Observable<PaginationResponse<EventGroup>> {
    return this.httpClient.put<PaginationResponse<EventGroup>>(
      `${this.URL_CONFIG.base}${this.URL_CONFIG.CRUDOperations}/${eventGroupId}`,
      this.preparePayload(eventGroup)
    );
  }

  public submitEventGroup(eventGroup: EventGroup): Observable<PaginationResponse<EventGroup>> {
    const eventGroupId = eventGroup.eventGroupId;
    const params: any = {
      communityCode: eventGroup.communityCode,
      versionNumber: eventGroup.versionNumber
    };

    return this.httpClient.put<PaginationResponse<EventGroup>>(
      `${this.URL_CONFIG.base}statusToPending/${eventGroupId}`,
      params
    );

  }

  public approveEventGroup(eventGroup: EventGroup): Observable<PaginationResponse<EventGroup>> {
    const eventGroupId = eventGroup.eventGroupId;
    const params: any = {
      communityCode: eventGroup.communityCode,
      versionNumber: eventGroup.versionNumber
    };

    return this.httpClient.put<PaginationResponse<EventGroup>>(
      `${this.URL_CONFIG.base}statusToApproved/${eventGroupId}`,
      params
    );

  }

  public rejectEventGroup(eventGroup: EventGroup, comment: string): Observable<PaginationResponse<EventGroup>> {
    const eventGroupId = eventGroup.eventGroupId;
    const params: any = {
      communityCode: eventGroup.communityCode,
      versionNumber: eventGroup.versionNumber,
      workflowVersionNumber: eventGroup.workflowVersionNumber,
      comment: comment
    };

    return this.httpClient.put<PaginationResponse<EventGroup>>(
      `${this.URL_CONFIG.base}statusToReject/${eventGroupId}`,
      params
    );

  }

  public publishEventGroup(eventGroup: EventGroup): Observable<PaginationResponse<EventGroup>> {
    const eventGroupId = eventGroup.eventGroupId;
    const params: any = {
      communityCode: eventGroup.communityCode,
      versionNumber: eventGroup.versionNumber,
      workflowVersionNumber: eventGroup.workflowVersionNumber,
    };

    return this.httpClient.put<PaginationResponse<EventGroup>>(
      `${this.URL_CONFIG.base}statusToActive/${eventGroupId}`,
      params
    );
  }

  public deactivateEventGroup(
    eventGroup: EventGroup,
    comment: string,
    workflowAction: WorkFlowAction.DEACTIVATE | WorkFlowAction.SUBMIT_FOR_DEACTIVATE | WorkFlowAction.REJECT_DEACTIVATION |
      WorkFlowAction.APPROVE_DEACTIVATION | WorkFlowAction.ARCHIVE
  ): Observable<PaginationResponse<EventGroup>> {

    const eventGroupId = eventGroup.eventGroupId;

    const params: any = {
      communityCode: eventGroup.communityCode,
      comment: comment,
      workflowVersionNumber: eventGroup.workflowVersionNumber,
      versionNumber: eventGroup.versionNumber
    }

    let endpoint: string = EMPTY;

    if (((workflowAction === WorkFlowAction.DEACTIVATE) || (workflowAction === WorkFlowAction.APPROVE_DEACTIVATION))
    ) {
      endpoint = 'statusToInActive';
    } else if (workflowAction === WorkFlowAction.SUBMIT_FOR_DEACTIVATE) {
      endpoint = 'statusToPendingDeactivation';
    } else if (workflowAction === WorkFlowAction.REJECT_DEACTIVATION) {
      endpoint = 'statusToDeactivationRejected';
    }

    return this.httpClient.put<PaginationResponse<EventGroup>>(
      `${this.URL_CONFIG.base}${endpoint}/${eventGroupId}`,
      { ...params }
    );
  }

  public getEventGroups(params: any = {}): Observable<PaginationResponse<EventGroup[]>> {
    return this.httpClient.get<PaginationResponse<EventGroup[]>>(
      `${this.URL_CONFIG.base}${this.URL_CONFIG.listEventGroups}${QUESTION_MARK}${this.searchTableService.prepareSearchParams(params, this.sortMapping)}`
    );
  }

  public getPublishedEventGroups(params: any = {}): Observable<PaginationResponse<EventGroup[]>> {
    return this.httpClient.get<PaginationResponse<EventGroup[]>>(
      `${this.URL_CONFIG.base}${this.URL_CONFIG.listPublishedEventGroups}${QUESTION_MARK}${this.searchTableService.prepareSearchParams(params, this.sortMapping)}`
    );
  }

  public getEventGroupMessages(eventGroupId: number, params: any = {}): Observable<PaginationResponse<Array<CommentModel>>> {
    return this.httpClient.get<PaginationResponse<Array<CommentModel>>>(
      `${this.env.getUrls().baseUrl}api/v1/message/${this.URL_CONFIG.listEventGroupMessages}/${eventGroupId}`, { params }
    );
  }

  public postEventGroupMessage(params: any = {}): Observable<PaginationResponse<CommentModel>> {
    return this.httpClient.post<PaginationResponse<CommentModel>>(
      `${this.env.getUrls().baseUrl}api/v1/message/${this.URL_CONFIG.eventGroupMessage}`, { ...params }
    );
  }


  public getReusableEventGroups(communityCode: string): Observable<PaginationResponse<EventGroup[]>> {
    const params = {
      communityCode: communityCode,
      page: 0,
      size: 50,
      sort: 'eventGroupName,asc'
    };

    return this.httpClient.get<PaginationResponse<EventGroup[]>>(
      `${this.URL_CONFIG.base}${this.URL_CONFIG.listReUsableEventGroups}`,
      { params }
    );
  }



  public createEventGroupByTemplate(eventGroup: any): Observable<PaginationResponse<EventGroup>> {
    return this.httpClient.post<PaginationResponse<EventGroup>>(
      `${this.URL_CONFIG.base}fromTemplate`,
      this.prepareEventGroupByTemplatePayload(eventGroup)
    );
  }

  public updateEventGroupByTemplate(eventGroup: EventGroup): Observable<PaginationResponse<EventGroup>> {
    return this.httpClient.put<PaginationResponse<EventGroup>>(
      `${this.URL_CONFIG.base}fromTemplate/${eventGroup.eventGroupId}`,
      this.prepareEventGroupByTemplatePayload(eventGroup)
    );
  }

  public getComparisonValues(condition: EventCondition): string {
    const criteriaValues = condition?.criteriaValues;

    const isCompletedEventCondition = condition.attributeDisplayName === SpecialAttribute.Previously_Completed_Events;

    if (criteriaValues) {
      if (Utils.isNotNull(criteriaValues.criteriaValues)) {
        return criteriaValues.criteriaValues.map(v => isCompletedEventCondition ? `Event Id:${v.id} Event Name:${v.label}` : v.label).join(COMMA_SEPARATOR);
      } else {
        const value1 = criteriaValues.singleCriteriaValue1 || EMPTY;
        const value2 = criteriaValues.singleCriteriaValue2 || EMPTY;

        return ((value1) + ((!!value2 && !!value1) ? (COMMA_SEPARATOR + value2) : value2)) || criteriaValues.singleSelectComparisonValueLabel || EMPTY;
      }
    }

    return EMPTY;
  }

  public parseResponse(response: PaginationResponse<EventGroup>): PaginationResponse<EventGroup> {
    const eventGroupResponse = response.data;

    if (eventGroupResponse.eventGroupStartDate) {
      const startDate = DateUtils.convertUTCDateTimeToLocalDateTime(eventGroupResponse.eventGroupStartDate);

      eventGroupResponse.eventGroupStartDate = startDate;
      eventGroupResponse.startTime = DateUtils.formatDateTime(startDate, DateTimeFormat.HH_MM_SS);
    }

    if (eventGroupResponse.eventGroupEndDate) {
      const endDate = DateUtils.convertUTCDateTimeToLocalDateTime(eventGroupResponse.eventGroupEndDate);

      eventGroupResponse.eventGroupEndDate = endDate;
      eventGroupResponse.endTime = DateUtils.formatDateTime(endDate, DateTimeFormat.HH_MM_SS);
    }

    if (eventGroupResponse && Utils.isNotNull(eventGroupResponse.eventStageList)) {
      eventGroupResponse.eventStageList.forEach((event: Event) => {
        event = this.eventService.parseResponse(new PaginationResponse<Event>(event)).data;
      });
    }

    return response;
  }


  // public openEventGroupDialog(
  //   eventGroupDialogMode: DialogMode,
  //   program: Program,
  //   eventGroupDetails?: EventGroup | null,

  // ) {
  //   this.dialogService.close();

  //   this.dialogService.open(
  //     CreateEditEventGroupComponent,
  //     {
  //       data: {
  //         eventGroupDialogMode: eventGroupDialogMode,
  //         program: program,
  //         eventGroupDetails: eventGroupDetails
  //       }
  //     });
  // }

  public openEventGroupByTemplateDialog(
    dialogConfig: EventGroupByTemplateDialogConfig
  ): MatDialogRef<CreateEditEventGroupByTemplateComponent> {
    return this.dialog.open(
      CreateEditEventGroupByTemplateComponent,
      {
        hasBackdrop: true,
        width: "1250px",
        disableClose: true,
        data: dialogConfig,
        ariaLabel: 'create-edit-template-dialog'
      }
    );
  }

  public preparePayload(eventGroup: EventGroup): EventGroup {
    if (eventGroup) {
      eventGroup.eventGroupStartDate = eventGroup.formattedStartDate;
      eventGroup.eventGroupEndDate = eventGroup.formattedEndDate;

      if (eventGroup.startTime) {
        eventGroup.eventGroupStartDate = `${eventGroup.eventGroupStartDate} ${eventGroup.startTime}`;
        eventGroup.eventGroupStartDate = DateUtils.convertLocalDateTimeToUTCDateTime(eventGroup.eventGroupStartDate, DateTimeFormat.MOMENT_YYYY_MM_DD_TIME);
      }

      if (eventGroup.endTime) {
        eventGroup.eventGroupEndDate = `${eventGroup.eventGroupEndDate} ${eventGroup.endTime}`;
        eventGroup.eventGroupEndDate = DateUtils.convertLocalDateTimeToUTCDateTime(eventGroup.eventGroupEndDate, DateTimeFormat.MOMENT_YYYY_MM_DD_TIME)
      }

      delete eventGroup.startTime;
      delete eventGroup.endTime;
      delete eventGroup.formattedStartDate;
      delete eventGroup.formattedEndDate;
    }

    return eventGroup;
  }

  public openEventGroupDeleteOrDiscardConfirmDialog(eventGroupId: number | null, params: any, afterCallBack: Function, isDeleteRequest: boolean) {
    const dialogConfig: DialogConfig<any> = {
      title: CONFIRM_MESSAGE,
      buttons: [
        {
          label: isDeleteRequest ? 'Delete' : 'Discard',
          color: ButtonColor.PRIMARY,
          click: () => {
            const eventGroupAction = isDeleteRequest ? this.deleteEventGroup(eventGroupId!, params) : this.discardEventGroup(eventGroupId!, params);

            eventGroupAction
              .subscribe({
                next: (response) => {
                  if (response.success) {
                    deleteOrDiscardDialog.close();
                    this.emitReloadEventGroup(true);
                    this.toggleAlertService.showSuccessMessage(`Event Group ${isDeleteRequest ? 'deleted' : 'discarded'} successfully.`);
                    afterCallBack();
                  } else {
                    this.toggleAlertService.showResponseErrors(response.errors);
                  }
                },
                error: error => {
                  console.log(error.error);
                }
              })
          }
        },
        {
          label: 'Cancel',
          color: ButtonColor.SECONDARY,
          click: () => {
            deleteOrDiscardDialog.close();
          }
        },
      ],
    }

    const deleteOrDiscardDialog = this.dialog.open(
      DialogComponent,
      {
        hasBackdrop: true, disableClose: true,
        data: dialogConfig
      }
    );

  }

  private deleteEventGroup(eventGroupId: number, params: any = {}): Observable<PaginationResponse<any>> {
    return this.httpClient.delete<PaginationResponse<any>>(
      `${this.URL_CONFIG.base}${this.URL_CONFIG.CRUDOperations}/${eventGroupId}`,
      { params }
    );
  }

  private discardEventGroup(eventGroupId: number, params: any = {}): Observable<PaginationResponse<any>> {
    return this.httpClient.put<PaginationResponse<any>>(
      `${this.URL_CONFIG.base}${this.URL_CONFIG.CRUDOperations}/${this.URL_CONFIG.rollback}/${eventGroupId}${QUESTION_MARK}${this.functionService.prepareParams(params)}`,
      {}
    );
  }


  private prepareEventGroupByTemplatePayload(entity: EventGroup) {
    const eventGroup = cloneDeep(this.preparePayload(entity));

    const templateEventList: any[] = [];

    if (Utils.isNotNull(eventGroup.eventStageList)) {
      eventGroup.eventStageList?.map(event => {

        templateEventList.push(
          {
            eventTemplateId: event.eventTemplateId,
            recurrenceLimit: event.recurrenceLimit! >= RecurrenceLimit.UpTo ? event.occurrence : event.recurrenceLimit,

            templateEventDetailList: event.eventDetails.map(condition => {
              this.eventService.prepareEventConditionPayload(condition);

              const conditionPayload: any = {
                eventDetailTemplateId: condition.eventDetailTemplateId || condition.id
              };

              if (!condition.eventRuleOperatorLocked) {
                conditionPayload['eventRuleOperator'] = condition.eventRuleOperator;
              }
              if (!condition.eventRulePropertyValLocked) {
                conditionPayload['criteriaValues'] = condition.criteriaValues;
              }

              return conditionPayload;
            }),
            templateActionStatementCreditList: event.eventActions
              .filter(action => action.eventActionType === EventActionType.StatementCredit)
              .map(act => {
                act.eventActionTemplateId = act.eventActionTemplateId || act.id;

                if (act.fulfillmentMonetaryType === EventActionFulfillmentMonetaryType.Fixed) {

                  act.fulfillmentConstraint = null;
                  act.amountType = EMPTY;
                  act.fulfillmentMonetaryValue = parseFloat(act.fulfillmentMonetaryValue).toFixed(2)

                } else {
                  act.fulfillmentConstraint = parseFloat(act.fulfillmentConstraint).toFixed(2);
                }

                return act;
              }),

            templateActionNotifyList: event.eventActions.
              filter(action => action.eventActionType !== EventActionType.StatementCredit)
              .map(act => {
                const fields = act.customFieldValueList?.filter(cf => Utils.isNotNull(cf.value));
                act.customFieldValueList = fields! || [];
                act.eventActionTemplateId = act.eventActionTemplateId || act.id;
                act.endpointMessageId = Array.isArray(act.endpointMessageId) ? act.endpointMessageId[0] : act.endpointMessageId;

                return act;
              })
          }
        );
      });
    }

    const payload: any = {
      eventGroupTemplateId: eventGroup.eventGroupTemplateId,
      eventGroupDescription: eventGroup.eventGroupDescription,
      communityCode: eventGroup.communityCode,
      eventGroupName: eventGroup.eventGroupName,
      eventGroupId: eventGroup.eventGroupId,
      eventGroupStartDate: eventGroup.eventGroupStartDate,
      eventGroupEndDate: eventGroup.eventGroupEndDate,
      programStageId: eventGroup.programStageId,
      uiStructurePos: eventGroup.uiStructurePos,
      versionNumber: eventGroup.versionNumber,
      templateEventList: templateEventList,

    };

    return payload;
  }
}
