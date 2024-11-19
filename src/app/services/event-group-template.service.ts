import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AbstractControl, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SearchTableComponent } from '../shared/search-table/search-table.component';
import { SearchTableColumn, SearchTableColumnType, SortDirection } from '../shared/search-table/search-table.model';
import { SearchTableService } from '../shared/search-table/search-table.service';
import { QUESTION_MARK } from '../core/constants';
import { Option } from '../core/models/option.model';
import { PaginationResponse, ResponseError } from '../core/models/pagination-response.model';
import { UserRole } from '../core/models/user.model';
import { EventGroupTemplate, EventGroupTemplateWorkflowAutomationType, EventGroupTemplateWorkflowAutomationTypeDesc } from '../pages/event-group-template/event-group-template.model';
import { AuthorizationService } from './authorization.service';
import { FormService } from './form-service/form.service';
import { EventGroupService } from './program/event-group/event-group.service';
import { CommentModel } from '../shared/comments-modal/comments-modal.model';
import { ApiConfigService } from './api-config.service';

@Injectable({
  providedIn: 'root'
})
export class EventGroupTemplateService {
  private readonly URL_CONFIG = {
    base: `${this.env.getUrls().baseUrl}api/v1/eventgroup/`,
    CRUDOperations: 'template',
    advancedSearch: 'listTemplates'
  };

  private readonly sortMapping: { [key: string]: string } = {
    startDate: 'eventGroupStartDate',
    endDate: 'eventGroupEndDate'
  };

  private errorMessages = {};
  private userRole: UserRole;
  public communityCode!: string;

  constructor(
    private searchTableService: SearchTableService,
    private formService: FormService,
    private httpClient: HttpClient,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private eventGroupService: EventGroupService,
    private authorizationService: AuthorizationService,
    private env: ApiConfigService
  ) {
    this.activatedRoute.queryParams.subscribe(params => {
      this.communityCode = params['client'];
    });

    this.userRole = this.authorizationService.getUserRole();
  }

  private parseResponse(response: any): any {
    const parsedResponse = this.eventGroupService.parseResponse(response);

    return parsedResponse;
  }

  private preparePayload(payload: EventGroupTemplate) {
    delete payload.startTime;
    delete payload.endTime;
    delete payload.formattedStartDate;
    delete payload.formattedEndDate;
    delete payload.eventGroupStartDate;
    delete payload.eventGroupEndDate;


    return payload;
  }

  public advancedSearch(params: any = {}): Observable<PaginationResponse<EventGroupTemplate[]>> {
    const payload: any = {
      communityCode: this.communityCode,
      ...params
    };


    return this.httpClient.get<PaginationResponse<EventGroupTemplate[]>>(
      `${this.URL_CONFIG.base}${this.URL_CONFIG.advancedSearch}${QUESTION_MARK}${this.searchTableService.prepareSearchParams(payload, this.sortMapping)}`
    );
  }

  public getEventGroupTemplate(id: number, forCreate: boolean = false): Observable<PaginationResponse<EventGroupTemplate>> {
    return this.httpClient.get<PaginationResponse<EventGroupTemplate>>(
      `${this.URL_CONFIG.base}${this.URL_CONFIG.CRUDOperations}/${id}`
    ).pipe(map(response => forCreate ? response : this.parseResponse(response)));
  }



  public createEventGroupTemplate(eventGroupTemplate: EventGroupTemplate): Observable<PaginationResponse<EventGroupTemplate>> {
    return this.httpClient.post<PaginationResponse<EventGroupTemplate>>(
      `${this.URL_CONFIG.base}${this.URL_CONFIG.CRUDOperations}`,
      this.preparePayload(eventGroupTemplate));
  }

  public updateEventGroupTemplate(eventGroupTemplateId: null | number, eventGroupTemplate: EventGroupTemplate): Observable<PaginationResponse<EventGroupTemplate>> {
    return this.httpClient.put<PaginationResponse<EventGroupTemplate>>(
      `${this.URL_CONFIG.base}${this.URL_CONFIG.CRUDOperations}/${eventGroupTemplateId}`,
      this.preparePayload(eventGroupTemplate)
    );
  }

  public summitEventGroup(eventGroup: EventGroupTemplate): Observable<PaginationResponse<EventGroupTemplate>> {
    const eventGroupTemplateId = eventGroup.eventGroupTemplateId;
    const params: any = {
      communityCode: eventGroup.communityCode,
      versionNumber: eventGroup.versionNumber
    };

    return this.httpClient.put<PaginationResponse<EventGroupTemplate>>(
      `${this.URL_CONFIG.base}${this.URL_CONFIG.CRUDOperations}/statusToPending/${eventGroupTemplateId}`,
      params
    );

  }

  public approveEventGroup(eventGroup: EventGroupTemplate): Observable<PaginationResponse<EventGroupTemplate>> {
    const eventGroupTemplateId = eventGroup.eventGroupTemplateId;
    const params: any = {
      communityCode: eventGroup.communityCode,
      versionNumber: eventGroup.versionNumber
    };

    return this.httpClient.put<PaginationResponse<EventGroupTemplate>>(
      `${this.URL_CONFIG.base}${this.URL_CONFIG.CRUDOperations}/statusToApproved/${eventGroupTemplateId}`,
      params
    );

  }

  public rejectEventGroup(eventGroup: EventGroupTemplate, comment: string): Observable<PaginationResponse<EventGroupTemplate>> {
    const eventGroupTemplateId = eventGroup.eventGroupTemplateId;
    const params: any = {
      communityCode: eventGroup.communityCode,
      versionNumber: eventGroup.versionNumber,
      workflowVersionNumber: 0,
      comment: comment
    };

    return this.httpClient.put<PaginationResponse<EventGroupTemplate>>(
      `${this.URL_CONFIG.base}${this.URL_CONFIG.CRUDOperations}/statusToReject/${eventGroupTemplateId}`,
      params
    );

  }

  public publishEventGroup(eventGroup: EventGroupTemplate): Observable<PaginationResponse<EventGroupTemplate>> {
    const eventGroupTemplateId = eventGroup.eventGroupTemplateId;
    const params: any = {
      communityCode: eventGroup.communityCode,
      versionNumber: eventGroup.versionNumber,
      workflowVersionNumber: 0,
    };

    return this.httpClient.put<PaginationResponse<EventGroupTemplate>>(
      `${this.URL_CONFIG.base}${this.URL_CONFIG.CRUDOperations}/statusToActive/${eventGroupTemplateId}`,
      params
    );
  }

  public deactivateEventGroup(eventGroup: EventGroupTemplate, comment: string): Observable<PaginationResponse<EventGroupTemplate>> {
    const eventGroupTemplateId = eventGroup.eventGroupTemplateId;
    const params: any = {
      communityCode: eventGroup.communityCode,
      workflowVersionNumber: 0,
      versionNumber: eventGroup.versionNumber,
      comment: comment
    }

    return this.httpClient.put<PaginationResponse<EventGroupTemplate>>(
      this.userRole === UserRole.VISA_GLOBAL_ADMIN
        ? `${this.URL_CONFIG.base}${this.URL_CONFIG.CRUDOperations}/statusToInactive/${eventGroupTemplateId}`
        : `${this.URL_CONFIG.base}${this.URL_CONFIG.CRUDOperations}/statusToPendingDeactivation/${eventGroupTemplateId}`,
      { ...params }
    );
  }

  public approveEventGroupDeactivation(eventGroup: EventGroupTemplate) {
    const eventGroupTemplateId = eventGroup.eventGroupTemplateId;
    const params: any = {
      communityCode: eventGroup.communityCode
    }

    return this.httpClient.put<PaginationResponse<EventGroupTemplate>>(
      `${this.URL_CONFIG.base}${this.URL_CONFIG.CRUDOperations}/statusToInactive/${eventGroupTemplateId}`,
      params
    )
  }

  public rejectEventGroupDeactivation(eventGroup: EventGroupTemplate, comment: string) {
    const eventGroupTemplateId = eventGroup.eventGroupTemplateId;
    const params: any = {
      communityCode: eventGroup.communityCode,
      workflowVersionNumber: 0,
      comment: comment,
      versionNumber: eventGroup.versionNumber,
    }

    return this.httpClient.put<PaginationResponse<EventGroupTemplate>>(
      `${this.URL_CONFIG.base}${this.URL_CONFIG.CRUDOperations}/statusToDeactivationRejected/${eventGroupTemplateId}`,
      params
    )
  }

  public deleteEventGroupTemplate(eventGroupTemplateId: number) {
    return this.httpClient.delete<PaginationResponse<EventGroupTemplate>>(
      `${this.URL_CONFIG.base}${this.URL_CONFIG.CRUDOperations}/${eventGroupTemplateId}`)
  }

  public getEventGroupTemplateMessages(eventGroupTemplateId: number, params: any) {
    return this.httpClient.get<PaginationResponse<Array<CommentModel>>>(
      `${this.env.getUrls().baseUrl}api/v1/message/listEventGroupTemplateMessages/${eventGroupTemplateId}`, {
      params
    }
    )
  }

  public postEventGroupTemplateMessage(params: any) {
    return this.httpClient.post<PaginationResponse<CommentModel>>(
      `${this.env.getUrls().baseUrl}api/v1/message/eventGroupTemplateMessage`, params
    )
  }

  public getEventGroupTemplateTableColumns(forSelector = false): SearchTableColumn[] {
    return [
      {
        key: 'eventGroupName',
        label: 'Event Group Template Name',
        sortDirection: SortDirection.ASC,
        type: forSelector ? SearchTableColumnType.DEFAULT : SearchTableColumnType.LINK,
        fixed: true,
        click: (row: EventGroupTemplate, component: SearchTableComponent) => {
          if (!forSelector) {
            this.router.navigate(['event-group-template', 'manage', row.eventGroupTemplateId], {
              queryParamsHandling: 'merge'
            });
          }

        }
      }
      ,
      {
        key: 'eventGroupDescription',
        label: 'Description',
        type: SearchTableColumnType.DEFAULT
      },
      {
        key: 'eventGroupTemplateId',
        label: 'ID'
      },
      {
        key: 'workflowType',
        label: 'Workflow Automation Type',
        mapValue: (row: EventGroupTemplate, table: SearchTableComponent) => {
          return EventGroupTemplateWorkflowAutomationTypeDesc[row?.workflowType!]
        }
      },
      {
        key: "eventGroupStatusCode",
        label: 'Status',
        type: SearchTableColumnType.STATUS
      }
    ];
  }

  public getAutomationTypes(): Option[] {
    return [
      new Option(EventGroupTemplateWorkflowAutomationType.None, EventGroupTemplateWorkflowAutomationTypeDesc[EventGroupTemplateWorkflowAutomationType.None]),
      new Option(EventGroupTemplateWorkflowAutomationType.AutoApprove, EventGroupTemplateWorkflowAutomationTypeDesc[EventGroupTemplateWorkflowAutomationType.AutoApprove]),
      new Option(EventGroupTemplateWorkflowAutomationType.AutoApproveAndPublish, EventGroupTemplateWorkflowAutomationTypeDesc[EventGroupTemplateWorkflowAutomationType.AutoApproveAndPublish]),
    ];
  }


  public updateErrorMessages(responseErrors: ResponseError[], form: UntypedFormGroup) {
    const additionalErrors = this.formService.prepareErrorObject(responseErrors);

    this.errorMessages = { ...this.errorMessages, ...additionalErrors };

    this.formService.setResponseErrors(responseErrors, form);
  }

  public getErrorMessage(form: UntypedFormGroup, fromControl: AbstractControl): string {
    return this.formService.getFormControlErrorMessage(
      form,
      fromControl,
      this.errorMessages
    );
  }

}
