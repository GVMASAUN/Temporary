import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginationResponse } from 'src/app/core/models/pagination-response.model';
import { PwPCSRTxResult, PwpPanCardEligibility } from 'src/app/pages/pay-with-point/pwp-pan-elibility.model';
import { ApiConfigService } from '../api-config.service';
import { SPLIT_PATTERN } from 'src/app/pages/pay-with-point/pwpConstants';

@Injectable({
  providedIn: 'root'
})
export class PwpCsrService {
  private readonly URL_CONFIG = {
    base: `${this.env.getUrls().baseUrl}api/v1/pwpcsr/`,
    cardeligibility: 'cardeligibility',
    txstatus: 'txstatus'
  };


  constructor(
    private httpClient: HttpClient,
    private env: ApiConfigService

  ) { }

  public getPanList(filters: any): string[] {
    const panList = (filters?.['pans'] || '').split(',');

    return panList;
  }

  public getPans(filters: { [key: string]: string; }): Observable<PaginationResponse<{ cardStatusList: PwpPanCardEligibility[]; }>> {
    const enrollmentId: string = filters?.['subTenantId'] || filters?.['tenantId'];

    const params: any = {
      pans: this.getPanList(filters)
    };

    return this.httpClient.post<PaginationResponse<{ cardStatusList: PwpPanCardEligibility[]; }>>(`${this.URL_CONFIG.base}${this.URL_CONFIG.cardeligibility}/${enrollmentId}`, params);
  }

  public getTransactions(filters: { [key: string]: string; }): Observable<PaginationResponse<PwPCSRTxResult[]>> {
    const trxtIds = (filters?.['trxtIds'] || '').split(SPLIT_PATTERN);
    const enrollmentId: string = filters?.['subTenantId'] || filters?.['tenantId'];

    const params: any = {
      pwpTransactionIds: trxtIds,
      pan: filters?.['pan']
    };

    return this.httpClient.post<PaginationResponse<PwPCSRTxResult[]>>(`${this.URL_CONFIG.base}${this.URL_CONFIG.txstatus}/${enrollmentId}`, params);
  }
}
