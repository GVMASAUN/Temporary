import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { QUESTION_MARK } from 'src/app/core/constants';
import { PaginationResponse } from 'src/app/core/models/pagination-response.model';
import { EventGroupHistory } from 'src/app/pages/programs/event-group.model';
import { User } from 'src/app/pages/users/user.model';
import { SearchTableService } from 'src/app/shared/search-table/search-table.service';
import { FunctionsService } from '../../util/functions.service';
import { ApiConfigService } from '../../api-config.service';

@Injectable({
  providedIn: 'root'
})
export class EventGroupHistoryService {
  private readonly URL_CONFIG = {
    base: `${this.env.getUrls().baseUrl}api/v1/`,
    CRUDOperations: 'eventgroup/history',
    history: 'getHistory',
    historyUsers: 'getHistoryUsers'
  }

  constructor(
    private searchTableService: SearchTableService,
    private functionService: FunctionsService,
    private httpClient: HttpClient,
    private env: ApiConfigService
  ) { }

  getHistoryRecords(params: any = {}): Observable<PaginationResponse<Array<EventGroupHistory>>> {
    return this.httpClient.get<PaginationResponse<Array<EventGroupHistory>>>(
      `${this.URL_CONFIG.base}${this.URL_CONFIG.CRUDOperations}/${this.URL_CONFIG.history}${QUESTION_MARK}${this.searchTableService.prepareSearchParams(params)}`
    );
  }

  getHistoryUsers(params: any = {}): Observable<PaginationResponse<Array<User>>> {
    return this.httpClient.get<PaginationResponse<Array<User>>>(
      `${this.URL_CONFIG.base}${this.URL_CONFIG.CRUDOperations}/${this.URL_CONFIG.historyUsers}${QUESTION_MARK}${this.functionService.prepareParams(params)}`
    );
  }
}
