import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ApiConfigService } from '../api-config.service';

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  private apiUrl: string = this.env.getUrls()?.baseUrl;
  private docUrl: string = this.env.getUrls()?.docUrl;

  private headers(contentType?: string) {
    let headers = {};
    if (contentType) {
      return new HttpHeaders({
        'Content-Type': contentType,
        ...headers
      });
    } else {
      return new HttpHeaders({
        // 'Content-Type': 'application/json',
        ...headers
      });
    }
  }

  /**
   * Helper Method that will generate the queryString.
   * @param params Object to be converted into URLSearchParam.
   */
  private generateQueryString(params?: any): string {
    let queryString = '',
      httpParam = new URLSearchParams();
    Object.keys(params || {}).forEach(key => httpParam.set(key, params[key]));
    queryString = httpParam.toString() ? `?${httpParam.toString()}` : '';
    return queryString;
  }

  constructor(
    private http: HttpClient,
    private env: ApiConfigService
  ) { }

  /**
   * for using get method.
   * @param url : url where request will be sent
   * @param params
   */
  get(url: string, params?: object) {
    const apiUrl = `${this.apiUrl}${url}${this.generateQueryString(params)}`;
    return this.http.get(apiUrl, {
      headers: this.headers(),
      responseType: 'text',
      withCredentials: true,
      observe: 'response'
    });
  }

  /**
   * for using post method
   * @param url : url where request will be send
   * @param data : body part of post data
   * @param params : Query params
   */
  post(url: string, data?: any, params?: object, appendCspHeader: boolean = false) {
    const apiUrl = `${this.apiUrl}${url}${this.generateQueryString(params)}`;
    let headers = this.headers();

    if (appendCspHeader) {
      headers = headers.set('Content-Security-Policy', "frame-ancestors 'none'");
    }

    return this.http.post(apiUrl, data, {
      headers: headers,
      responseType: 'text',
      observe: 'response'
    });
  }

  /**
   * for using put method
   * @param url : url where request will be send
   * @param data : body part of post data
   * @param params : Query params
   */
  put(url: string, data?: any, params?: object) {
    const apiUrl = `${this.apiUrl}${url}${this.generateQueryString(params)}`;
    return this.http.put(apiUrl, data, {
      headers: this.headers(),
      responseType: 'text',
      observe: 'response'
    });
  }
}
