import { HttpClient } from '@angular/common/http';
import { CommunityGroup, EpmTemplate, MessageField } from 'src/app/pages/explore-templates/explore-template.model';
import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { SearchTableService } from 'src/app/components/search-table/search-table.service';
import { QUESTION_MARK } from 'src/app/core/constants';
import { PaginationResponse, ResponseError } from 'src/app/core/models/pagination-response.model';
import { ExploreTemplate } from 'src/app/pages/explore-templates/explore-template.model';
import { FormGroup } from '@angular/forms';
import { FormService } from '../form-service/form.service';
import { ApiConfigService } from '../api-config.service';


@Injectable({
  providedIn: 'root'
})
export class ExploreTemplateService {
  private readonly URL_CONFIG = {
    base: `${this.env.getUrls().baseUrl}api/v1/`,
    templateList: 'message/listEndpointMessages',
    messageField: 'message/listEPMProperties',
    endPointMessage: 'message/endpointMessage',
    communityGroup: 'community/parentCommunity'
  };

  private errorMessages = {
    default: {
      invalid: 'Invalid Entry.',
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
    private router: ActivatedRoute,
    private env: ApiConfigService
  ) {
    this.router.queryParams.subscribe(params => {
      this.communityCode = params['client'];
    });
  }

  public updateErrorMessages(responseErrors: ResponseError[], form: FormGroup) {
    const additionalErrors = this.formService.prepareErrorObject(responseErrors);

    this.errorMessages = { ...this.errorMessages, ...additionalErrors };

    this.formService.setResponseErrors(responseErrors, form);
  }

  public getErrorMessage(form: FormGroup, fromControlName: string): string {
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
