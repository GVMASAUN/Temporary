import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiConfigService {
  configData: any;
  private configLoaded$ = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) { }

  loadConfig() {
    const promise = new Promise<void>((resolve, reject) => {
      const apiUrl = "assets/config/config.json";
      firstValueFrom(this.http.get(apiUrl))
        .then(
          res => {
            this.configData = res;
            this.configLoaded$.next(true);
            resolve();
          }
        )
        .catch(err => reject(err));
    });
    return promise;
  }

  getUrls() {
    return this.configData;
  }

  getConfigLoaded() {
    return this.configLoaded$.asObservable();
  }
}