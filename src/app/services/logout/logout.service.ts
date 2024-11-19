import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../login/login.service';
import { AuthorizationService } from '../authorization.service';
import { ApiConfigService } from '../api-config.service';

@Injectable({
  providedIn: 'root'
})
export class LogoutService {
  private URL_CONFIG: any;

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthorizationService,
    private env: ApiConfigService
  ) { 
    this.env.getConfigLoaded().subscribe(loaded => {
      if (loaded) {
        this.URL_CONFIG = {
          base: `${this.env.getUrls().baseUrl}api/user/`,
          userDetails: 'getUserDetails',
        };
      }
    });
  }

  public logout() {
    this.http
      .get(`${this.URL_CONFIG.base}${this.URL_CONFIG.logout}`)
      .subscribe({
        next: (response: any) => {
          this.authService.clearUserSession();

          this.router.navigate(['login']);
        },
        error: (err: any) => {
          console.log(err);
        }
      });
  }
}
