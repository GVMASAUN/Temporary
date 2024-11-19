import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { SearchTableService } from 'src/app/shared/search-table/search-table.service';
import { QUESTION_MARK } from 'src/app/core/constants';
import { PaginationResponse } from 'src/app/core/models/pagination-response.model';
import { UncategorizedOffer } from 'src/app/pages/uncategorized-offers/uncategorized-offers.model';
import { ApiConfigService } from '../api-config.service';

@Injectable({
  providedIn: 'root'
})
export class UncategorizedOfferService {

  private readonly URL_CONFIG = {
    base: `${this.env.getUrls().baseUrl}api/offer/`,
    CRUDOperations: '',
    uncategorizedOffers: 'listUncategorizedOffers',
    getOffer: 'api/v1/published/offer'
  };

  public communityCode!: string;

  constructor(
    private searchTableService: SearchTableService,
    private httpClient: HttpClient,
    private router: ActivatedRoute,
    private env: ApiConfigService
  ) {
    this.router.queryParams.subscribe(params => {
      this.communityCode = params['client'];
    });
  }

  public getUncategorizedOfferList(params: any = {}): Observable<PaginationResponse<UncategorizedOffer>> {
    return this.httpClient.get<PaginationResponse<UncategorizedOffer>>(
      `${this.URL_CONFIG.base}${this.URL_CONFIG.uncategorizedOffers}${QUESTION_MARK}${this.searchTableService.prepareSearchParams(params)}`
    )

  }

  public getUncategorizedOffer(id: number): Observable<PaginationResponse<UncategorizedOffer>> {
    const params = {
      communityCode: this.communityCode
    };

    return this.httpClient.get<PaginationResponse<UncategorizedOffer>>(
      `${this.env.getUrls().baseUrl}api/v1/published/offer/${id}`
      , { params }
    ).pipe(map(response => this.parseResponse(response)));

  }

  public importOffer(offerId: number, programStageId: number): Observable<PaginationResponse<UncategorizedOffer>> {
    return this.httpClient.post<PaginationResponse<UncategorizedOffer>>(
      `${this.env.getUrls().baseUrl}api/v1/published/offer/import?offerId=${offerId}&programStageId=${programStageId}`
      , {}
    ).pipe(map(response => this.parseResponse(response)));
  }

  private parseResponse(response: PaginationResponse<UncategorizedOffer>): PaginationResponse<UncategorizedOffer> {
    return response;
  }
}