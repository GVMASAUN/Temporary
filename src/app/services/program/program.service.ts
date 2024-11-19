import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { ANY, EMPTY, INVALID_ENTRY, QUESTION_MARK } from 'src/app/core/constants';
import { Indicator } from 'src/app/core/models/indicator.model';
import { Option } from 'src/app/core/models/option.model';
import { PaginationResponse, ResponseError } from 'src/app/core/models/pagination-response.model';
import { StatusCode, StatusDesc } from 'src/app/core/models/status.model';
import { EventGroup } from 'src/app/pages/programs/event-group.model';
import { DialogMode, Program } from 'src/app/pages/programs/program.model';
import { Utils } from 'src/app/services/utils';
import { SearchTableService } from 'src/app/shared/search-table/search-table.service';
import { FormService } from '../form-service/form.service';
import { DateUtils } from '../util/dateUtils';
import { EventGroupService } from './event-group/event-group.service';
import { ApiConfigService } from '../api-config.service';

@Injectable({
  providedIn: 'root'
})
export class ProgramService {
  private readonly URL_CONFIG = {
    base: `${this.env.getUrls().baseUrl}api/program/`,
    CRUDOperations: 'program',
    programList: 'listPrograms',
    programSummary: `${this.env.getUrls().baseUrl}api/v1/program/programSummary`
  };

  public communityCode!: string;

  private readonly sortMapping: { [key: string]: string } = {
    startDate: 'programStartDate',
    endDate: 'programEndDate',
    programTypeName: 'programType'
  };

  private errorMessages = {
    default: {
      invalid: INVALID_ENTRY,
      required: 'This is a required field.'
    }
  };

  constructor(
    private searchTableService: SearchTableService,
    private httpClient: HttpClient,
    private router: ActivatedRoute,
    private formService: FormService,
    private eventGroupService: EventGroupService,
    private env: ApiConfigService
  ) {
    this.router.queryParams.subscribe(params => {
      this.communityCode = params['client'];
    });
  }

  public preparePayload(program: Program) {
    const payload = {
      communityCode: program.communityCode,
      programName: program.programName,
      programBudget: program.programBudget,
      programDescription: program.programDescription,
      epmResponseFlowEnabled: program.epmResponseFlowEnabled,
      versionNumber: program.versionNumber
    }

    return payload;
  }

  public updateErrorMessages(responseErrors: ResponseError[], form: FormGroup) {
    const additionalErrors = this.formService.prepareErrorObject(responseErrors);

    this.errorMessages = { ...this.errorMessages, ...additionalErrors };

    this.formService.setResponseErrors(responseErrors, form);
  }

  public createProgram(program: Program): Observable<PaginationResponse<Program>> {
    return this.httpClient.post<PaginationResponse<Program>>(
      `${this.URL_CONFIG.base}${this.URL_CONFIG.CRUDOperations}`,
      program
    );
  }

  public updateProgram(program: Program): Observable<PaginationResponse<Program>> {
    return this.httpClient.put<PaginationResponse<Program>>(
      `${this.URL_CONFIG.base}${this.URL_CONFIG.CRUDOperations}/${program.programStageId}`,
      this.preparePayload(program)
    );
  }

  public getProgram(id: number): Observable<PaginationResponse<Program>> {
    return this.httpClient.get<PaginationResponse<Program>>(
      `${this.URL_CONFIG.base}${this.URL_CONFIG.CRUDOperations}/${id}`
    ).pipe(map(response => this.parseResponse(response)));
  }

  public getProgramSummary(id: number, isPublished: boolean): Observable<PaginationResponse<Program>> {
    const params = {
      getPublishedEventGroups: isPublished ? 'true' : 'false'
    }

    return this.httpClient.get<PaginationResponse<Program>>(
      `${this.URL_CONFIG.programSummary}/${id}`, { params }
    ).pipe(map(response => this.parseResponse(response)));
  }


  public getProgramList(params: any = {}): Observable<PaginationResponse<any>> {
    return this.httpClient.get<PaginationResponse<any>>(
      `${this.URL_CONFIG.base}${this.URL_CONFIG.programList}${QUESTION_MARK}${this.searchTableService.prepareSearchParams(params, this.sortMapping)}`
    );
  }

  public getProgramStatusList(params: any = {}) {
    const statusList: Option[] = [
      {
        label: ANY,
        value: EMPTY
      },
      {
        label: StatusDesc.ERROR,
        value: StatusCode.ERROR
      },
      {
        label: StatusDesc.DRAFT,
        value: StatusCode.DRAFT
      },
    ];

    const publishedStatuses: Option[] = [
      {
        label: StatusDesc.ACTIVE,
        value: StatusCode.ACTIVE
      },
      {
        label: StatusDesc.INACTIVE,
        value: StatusCode.INACTIVE
      },
      {
        label: StatusDesc.PENDING_DEACTIVATION_REVIEW,
        value: StatusCode.PENDING_DEACTIVATION_REVIEW
      },
      {
        label: StatusDesc.DEACTIVATION_REJECTED,
        value: StatusCode.DEACTIVATION_REJECTED
      }
    ];

    const unPublishedStatuses: Option[] = [
      {
        label: StatusDesc.PENDING_REVIEW,
        value: StatusCode.PENDING_REVIEW
      },
      {
        label: StatusDesc.REJECT,
        value: StatusCode.REJECTED
      },
      {
        label: StatusDesc.APPROVED,
        value: StatusCode.APPROVED
      }
    ];


    if (params.isPublished === Indicator.yes) {
      statusList.push(...publishedStatuses);
    } else {
      statusList.push(...unPublishedStatuses);
    }

    return of(statusList);
  }

  public getProgramStructures(): Observable<PaginationResponse<any[]>> {
    return this.httpClient.get<PaginationResponse<any[]>>(`${this.env.getUrls().baseUrl}api/v1/reference/listStructures`);
  }

  public getErrorMessage(form: FormGroup, fromControlName: string): string {
    return this.formService.getFormControlErrorMessage(
      form,
      fromControlName,
      this.errorMessages
    );
  }

  getDisabledStartDateTimeMessage(eventGroupDetais: EventGroup, dialogMode: DialogMode): string | null {
    const currentDate = moment().toDate();
    const startDate = DateUtils.convertUTCDateTimeToLocalDateTime(eventGroupDetais.startDate!);

    if (dialogMode !== DialogMode.CREATE) {
      if (
        (
          (eventGroupDetais.eventGroupStatusCode === StatusCode.ACTIVE) ||
          (eventGroupDetais.eventGroupStatusCode === StatusCode.DEACTIVATION_REJECTED) ||
          (eventGroupDetais.eventGroupStatusCode === StatusCode.INACTIVE)
        )
        && DateUtils.dateRangeValidator(startDate, currentDate)
      ) {
        return `You cannot change the start date/time because this Event Group was published
          and the present date/time exceeds the assigned start/date time value. Once an Event 
          Group is published and becomes eligible for activity (current date/time >= start date/time), 
          the start date/time value becomes locked for the current published version and any subsequent versions.`;
      }
    }

    return null;
  }

  getDisabledEndDateTimeMessage(eventGroupDetais: EventGroup, dialogMode: DialogMode): string | null {
    const currentDate = moment().toDate();
    const endDate = DateUtils.convertUTCDateTimeToLocalDateTime(eventGroupDetais.endDate!);

    if (dialogMode !== DialogMode.CREATE) {
      if (
        ((eventGroupDetais.eventGroupStatusCode !== StatusCode.APPROVED) &&
          (eventGroupDetais.eventGroupStatusCode !== StatusCode.DRAFT)) &&
        DateUtils.dateRangeValidator(endDate, currentDate)
      ) {
        return `You cannot change the end date/time because this Event Group was published 
          and the original effective date range window has passed (current date/time >= end date/time).  
          The end date/time may be modified to a future date/time if the original published version’s 
          end date/time has not lapsed.`;
      }
    }

    return null;
  }

  private parseResponse(response: PaginationResponse<Program>) {
    const program = response.data;

    if (Utils.isNotNull(program?.eventGroupList)) {
      program.eventGroupList
        .forEach(eventGroup => {
          this.eventGroupService.parseResponse(new PaginationResponse<EventGroup>(eventGroup));
        });
    }

    return response;
  }
}
