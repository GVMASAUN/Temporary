import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { PaginationResponse } from 'src/app/core/models/pagination-response.model';
import { EventAttribute, MerchantCategory } from 'src/app/pages/programs/event.model';
import { ApiConfigService } from 'src/app/services/api-config.service';

@Injectable({
  providedIn: 'root'
})
export class AttributeService {
  private readonly URL_CONFIG = {
    base: `${this.env.getUrls().baseUrl}api/v1/eventAttr/`,
    CRUDOperations: 'eventAttr',
    attributes: 'listEventAttrs'
  };

  constructor(
    private httpClient: HttpClient,
    private env: ApiConfigService
  ) { }



  public getAttributes(params: any): Observable<PaginationResponse<EventAttribute[]>> {
    return this.httpClient.get<PaginationResponse<EventAttribute[]>>(
      `${this.URL_CONFIG.base}${this.URL_CONFIG.attributes}`,
      { params }
    );
  }

  public getAttributeValues(apiPath: string, id: number, params: any): Observable<PaginationResponse<MerchantCategory[]>> {
    return this.httpClient.get<PaginationResponse<MerchantCategory[]>>(
      `${this.URL_CONFIG.base}${apiPath}/values/${id}`,
      { params }
    );
  }

}
