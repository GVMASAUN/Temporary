import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SearchTableService } from 'src/app/shared/search-table/search-table.service';
import { QUESTION_MARK } from 'src/app/core/constants';
import { PaginationResponse } from 'src/app/core/models/pagination-response.model';
import { Region, User, UserHistory, UserRole } from 'src/app/pages/users/user.model';
import { ApiConfigService } from '../api-config.service';


@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly URL_CONFIG = {
    base: `${this.env.getUrls().baseUrl}api/v1/`,
    CRUDOperations: 'user',
    userList: 'getUsersByUserData',
    userRole: 'getUserRoles',
    userRegion: 'getUserRegions',
    manageBidAssn: 'updateUserBidAssn',
    manageRegionAssn: 'updateUserRegionAssn',
    history: 'history'
  };

  constructor(
    private searchTableService: SearchTableService,
    private httpClient: HttpClient,
    private env: ApiConfigService
  ) { }

  public getUserList(params: any = {}): Observable<PaginationResponse<Array<User>>> {
    return this.httpClient.get<PaginationResponse<Array<User>>>(
      `${this.URL_CONFIG.base}${this.URL_CONFIG.CRUDOperations}/${this.URL_CONFIG.userList}${QUESTION_MARK}${this.searchTableService.prepareSearchParams(params)}`
    );
  }

  public getUserHistory(userId: null | string, params: any = {}): Observable<PaginationResponse<UserHistory>> {
    return this.httpClient.get<PaginationResponse<UserHistory>>(
      `${this.URL_CONFIG.base}${this.URL_CONFIG.CRUDOperations}/${this.URL_CONFIG.history}/${userId}${QUESTION_MARK}${this.searchTableService.prepareSearchParams(params)}`
    )
  }

  public getUserById(userId: null | string): Observable<PaginationResponse<User>> {
    return this.httpClient.get<PaginationResponse<User>>(
      `${this.URL_CONFIG.base}${this.URL_CONFIG.CRUDOperations}/${userId}`
    )
  }

  public getUserRoles(): Observable<PaginationResponse<Array<UserRole>>> {
    return this.httpClient.get<PaginationResponse<Array<UserRole>>>(
      `${this.URL_CONFIG.base}${this.URL_CONFIG.CRUDOperations}/${this.URL_CONFIG.userRole}`
    )
  }

  public getUserRegions(): Observable<PaginationResponse<Array<Region>>> {
    return this.httpClient.get<PaginationResponse<Array<Region>>>(
      `${this.URL_CONFIG.base}${this.URL_CONFIG.CRUDOperations}/${this.URL_CONFIG.userRegion}`
    )
  }

  public manageUserBid(formData: FormData): Observable<PaginationResponse<User>> {
    return this.httpClient.post<PaginationResponse<User>>(
      `${this.URL_CONFIG.base}${this.URL_CONFIG.CRUDOperations}/${this.URL_CONFIG.manageBidAssn}`,
      formData
    )
  }

  public manageRegionAssignment(formData: FormData): Observable<PaginationResponse<User>> {
    return this.httpClient.post<PaginationResponse<User>>(
      `${this.URL_CONFIG.base}${this.URL_CONFIG.CRUDOperations}/${this.URL_CONFIG.manageRegionAssn}`,
      formData
    )
  }

}
