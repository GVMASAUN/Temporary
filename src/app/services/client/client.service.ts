import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SearchTableService } from 'src/app/shared/search-table/search-table.service';
import { EMPTY, QUESTION_MARK } from 'src/app/core/constants';
import { PaginationResponse } from 'src/app/core/models/pagination-response.model';
import { Community } from 'src/app/pages/clients/clients.model';
import { ApiConfigService } from '../api-config.service';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private readonly URL_CONFIG = {
    base: `${this.env.getUrls().baseUrl}api/community/`,
    communityList: 'listCommunities',
    clientGroupList: 'listGroupCommunities',
    clientCommunityList: 'listClientCommunities'
  };

  public communityCode: string = EMPTY;

  constructor(
    private http: HttpClient,
    private searchTableService: SearchTableService,
    private env: ApiConfigService
  ) { }

  public setCommunityCode(code: string) {
    this.communityCode = code;
  }

  public getCommunityList(params: any = {}): Observable<PaginationResponse<Community>> {
    return this.http.get<PaginationResponse<Community>>(
      `${this.URL_CONFIG.base}${this.URL_CONFIG.communityList}`, { params }
    )
  }

  public getClientGroupList(params: any = {}): Observable<PaginationResponse<Community>> {
    return this.http.get<PaginationResponse<Community>>(
      `${this.URL_CONFIG.base}${this.URL_CONFIG.clientGroupList}`, { params }
    )
  }

  public getClientList(params: any = {}): Observable<PaginationResponse<Community>> {
    return this.http.get<PaginationResponse<Community>>(
      `${this.URL_CONFIG.base}${this.URL_CONFIG.clientCommunityList}${QUESTION_MARK}${this.searchTableService.prepareSearchParams(params)}`
    );
  }
}
