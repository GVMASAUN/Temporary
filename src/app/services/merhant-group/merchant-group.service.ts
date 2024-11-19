import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { COMMA, DateTimeFormat, NEWLINE, QUESTION_MARK } from 'src/app/core/constants';
import { PaginationResponse, ResponseError } from 'src/app/core/models/pagination-response.model';
import { UserRole } from 'src/app/core/models/user.model';
import { MerchantGroupHistory } from 'src/app/pages/merchant/merchant.model';
import { User } from 'src/app/pages/users/user.model';
import { SearchTableService } from 'src/app/shared/search-table/search-table.service';
import { ApiConfigService } from '../api-config.service';
import { FormService } from '../form-service/form.service';
import { DateUtils } from '../util/dateUtils';
import { FunctionsService } from '../util/functions.service';

@Injectable({
  providedIn: 'root'
})
export class MerchantGroupService {
  private readonly URL_CONFIG = {
    base: `${this.env.getUrls().baseUrl}api/v1/`,
    merchantGroup: 'merchantgroup',

    merchantGroupHistory: 'merchantgroup/history',
    historyById: 'getHistoryByHistoryId',
    historyList: 'getHistory',
    historyUsersList: 'getHistoryUsers'
  }

  private errorMessages = {
  };

  private eventDialogConfigData: any = {};

  public userRole!: UserRole;

  constructor(
    private formService: FormService,
    private searchTableService: SearchTableService,
    private httpClient: HttpClient,
    private functionService: FunctionsService,
    private env: ApiConfigService
  ) { }


  public updateErrorMessages(responseErrors: ResponseError[], formGroup: UntypedFormGroup) {
    const additionalErrors = this.formService.prepareErrorObject(responseErrors);

    this.errorMessages = { ...this.errorMessages, ...additionalErrors };

    this.formService.setResponseErrors(responseErrors, formGroup)
  }

  public getErrorMessage(form: UntypedFormGroup, fromControlName: string): string {
    return this.formService.getFormControlErrorMessage(
      form,
      fromControlName,
      this.errorMessages
    );
  }

  public getHistoryList(params: any = {}): Observable<PaginationResponse<MerchantGroupHistory>> {
    return this.httpClient.get<PaginationResponse<MerchantGroupHistory>>(
      `${this.URL_CONFIG.base}${this.URL_CONFIG.merchantGroupHistory}/${this.URL_CONFIG.historyList}${QUESTION_MARK}${this.searchTableService.prepareSearchParams(params)}`
    );
  }

  public getHistoryById(params: any = {}): Observable<PaginationResponse<Array<MerchantGroupHistory>>> {
    return this.httpClient.get<PaginationResponse<Array<MerchantGroupHistory>>>(
      `${this.URL_CONFIG.base}${this.URL_CONFIG.merchantGroupHistory}/${this.URL_CONFIG.historyById}${QUESTION_MARK}${this.searchTableService.prepareSearchParams(params)}`
    );
  }

  public getHistoryUserList(params: any = {}): Observable<PaginationResponse<Array<User>>> {
    return this.httpClient.get<PaginationResponse<Array<User>>>(
      `${this.URL_CONFIG.base}${this.URL_CONFIG.merchantGroupHistory}/${this.URL_CONFIG.historyUsersList}${QUESTION_MARK}${this.functionService.prepareParams(params)}`
    );
  }

  public parseCombinations(combinations: any): string {
    const combinationList: Array<string> = String(combinations).split(NEWLINE);

    for (let comIndex = 0; comIndex < combinationList.length; comIndex++) {
      const values: Array<string> = combinationList[comIndex].split(COMMA);

      for (let comValIndex = 0; comValIndex < values.length; comValIndex++) {

        if (
          moment(
            values[comValIndex],
            [
              DateTimeFormat.YYYY_MM_DD_HH_MM_SS,
              DateTimeFormat.YYYY_M_D_HH_MM_SS,
              DateTimeFormat.YYYY_M_D_H_M_S,
              DateTimeFormat.YYYY_MM_DD_H_M_S
            ],
            true
          ).isValid()
        ) {
          values[comValIndex] = DateUtils.convertLocalDateTimeToUTCDateTime(values[comValIndex], DateTimeFormat.YYYY_MM_DD_HH_MM_SS);
        }
      }

      combinationList[comIndex] = values.join(COMMA);
    }

    return combinationList.join(NEWLINE);
  }


  public updateSelectedMerchantDates(payload: any): Observable<any> {
    return this.httpClient.post(
      `${this.env.getUrls().baseUrl}api/${this.URL_CONFIG.merchantGroup}/updateEffectiveDateRangeForSelectedActiveMerchants`,
      payload
    );
  }
}
