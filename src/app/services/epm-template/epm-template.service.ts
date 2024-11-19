import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { SearchTableService } from 'src/app/shared/search-table/search-table.service';
import { INVALID_ENTRY, QUESTION_MARK } from 'src/app/core/constants';
import { PaginationResponse, ResponseError } from 'src/app/core/models/pagination-response.model';
import { CommunityGroup, EpmTemplate, EpmTemplateHistory, ExploreTemplate, MessageField } from 'src/app/pages/epm-template/epm-template.model';
import { FormService } from '../form-service/form.service';
import { User } from 'src/app/pages/users/user.model';
import { FunctionsService } from '../util/functions.service';
import { ApiConfigService } from '../api-config.service';


@Injectable({
  providedIn: 'root'
})
export class EpmTemplateService {
  private readonly URL_CONFIG = {
    base: `${this.env.getUrls().baseUrl}api/v1/`,
    templateList: 'message/listEndpointMessages',
    messageField: 'message/listEPMProperties',
    endPointMessage: 'message/endpointMessage',
    communityGroup: 'community/parentCommunity',
    templateHistory: 'message/history',
    historyList: 'getHistory',
    historyUsersList: 'getHistoryUsers'
  };

  private errorMessages = {
    default: {
      invalid: INVALID_ENTRY,
      required: 'Required'
    },
    messageName: {
      required: 'Please fill out the Template Name field.'
    },
    communityCode: {
      required: 'Please select an option.'
    }
  };

  public communityCode!: string;

  constructor(
    private searchTableService: SearchTableService,
    private formService: FormService,
    private httpClient: HttpClient,
    private functionService: FunctionsService,
    private router: ActivatedRoute,
    private env: ApiConfigService
  ) {
    this.router.queryParams.subscribe(params => {
      this.communityCode = params['client'];
    });
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

  public getCommunityGroup(): Observable<PaginationResponse<CommunityGroup>> {
    const params: any = {
      communityCode: this.communityCode
    };
    return this.httpClient.get<PaginationResponse<CommunityGroup>>(
      `${this.URL_CONFIG.base}${this.URL_CONFIG.communityGroup}`, { params }
    );
  }

  public getTemplateList(params: any = {}): Observable<PaginationResponse<ExploreTemplate>> {
    return this.httpClient.get<PaginationResponse<ExploreTemplate>>(
      `${this.URL_CONFIG.base}${this.URL_CONFIG.templateList}${QUESTION_MARK}${this.searchTableService.prepareSearchParams(params)}`
    );
  }

  public getMessageFields(): Observable<PaginationResponse<Array<MessageField>>> {
    return this.httpClient.get<PaginationResponse<Array<MessageField>>>(
      `${this.URL_CONFIG.base}${this.URL_CONFIG.messageField}`
    );
  }

  public createEpmTemplate(epmTemplate: EpmTemplate): Observable<PaginationResponse<EpmTemplate>> {
    return this.httpClient.post<PaginationResponse<EpmTemplate>>(
      `${this.URL_CONFIG.base}${this.URL_CONFIG.endPointMessage}`,
      this.preparePayload(epmTemplate)
    );
  }

  public getEpmTemplate(messageId: null | string, communityCode: null | string): Observable<PaginationResponse<EpmTemplate>> {
    const params: any = {
      communityCode: communityCode
    };
    return this.httpClient.get<PaginationResponse<EpmTemplate>>(
      `${this.URL_CONFIG.base}${this.URL_CONFIG.endPointMessage}/${messageId}`, { params }
    );
  }

  public updateEpmTemplate(epmTemplate: EpmTemplate): Observable<PaginationResponse<EpmTemplate>> {
    return this.httpClient.post<PaginationResponse<EpmTemplate>>(
      `${this.URL_CONFIG.base}${this.URL_CONFIG.endPointMessage}`,
      this.preparePayload(epmTemplate)
    );
  }

  public getEpmTemplateHistroy(params: any = {}): Observable<PaginationResponse<EpmTemplateHistory>> {
    return this.httpClient.get<PaginationResponse<EpmTemplateHistory>>(
      `${this.URL_CONFIG.base}${this.URL_CONFIG.templateHistory}/${this.URL_CONFIG.historyList}${QUESTION_MARK}${this.searchTableService.prepareSearchParams(params)}`
    );
  }

  public getHistoryUsers(params: any = {}): Observable<PaginationResponse<Array<User>>> {
    return this.httpClient.get<PaginationResponse<Array<User>>>(
      `${this.URL_CONFIG.base}${this.URL_CONFIG.templateHistory}/${this.URL_CONFIG.historyUsersList}${QUESTION_MARK}${this.functionService.prepareParams(params)}`
    );
  }

  private preparePayload(epmTemplate: EpmTemplate): EpmTemplate {

    if (epmTemplate) {

      if (!epmTemplate.messageId) {
        delete epmTemplate.messageId
      }

      if (epmTemplate.systemDefinedFieldAsList) {
        epmTemplate.systemDefinedField = epmTemplate.systemDefinedFieldAsList.toString();
      }

      if (epmTemplate.userDefinedFieldAsList) {
        epmTemplate.userDefinedField = epmTemplate.userDefinedFieldAsList.toString();
      } else {
        delete epmTemplate.userDefinedField;
      }

      delete epmTemplate.communityBID;
      delete epmTemplate.defaultMessageLanguageCode;
      delete epmTemplate.languageCode;
      delete epmTemplate.messageChannelCode;
      delete epmTemplate.formattedLastModifiedDate;
      delete epmTemplate.formattedMarkedForDeletionDate;
      delete epmTemplate.eventsUsingEPMMessage;
      delete epmTemplate.processedMessageCount;
      delete epmTemplate.systemDefinedFieldAsList;
      delete epmTemplate.userDefinedFieldAsList;
    }

    return epmTemplate;
  }
}
