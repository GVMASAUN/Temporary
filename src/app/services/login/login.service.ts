import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { SessionWarningDialogComponent } from 'src/app/core/session-warning-dialog/session-warning-dialog.component';
import { AuthorizationService } from '../authorization.service';
import { LogoutService } from '../logout/logout.service';
import { NavStatusService } from '../nav-status/nav-status.service';
import { ApiConfigService } from '../api-config.service';

const INACTIVITY_MONITORING_TIME = 15 * 60 * 1000; // Time in milli-seconds
const SESSION_EXPIRY_WARNING_TIME = 14 * 60 * 1000; // Time in milli-seconds

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private URL_CONFIG: any;

  subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthorizationService,
    private http: HttpClient,
    private router: Router,
    private status: NavStatusService,
    private logoutService: LogoutService,
    private dialog: MatDialog,
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

  public setInterval() {
    if (this.subscriptions) {
      this.subscriptions.map(sub => {
        sub.unsubscribe();
      });
    }

    const intervalSubscriber = interval(INACTIVITY_MONITORING_TIME).pipe().subscribe(
      () => {
        this.logout();
      });

    const warningSubscriber = interval(SESSION_EXPIRY_WARNING_TIME).pipe().subscribe(
      () => {
        this.showSessionExpiredWarning();
      });

    this.subscriptions.push(intervalSubscriber);
    this.subscriptions.push(warningSubscriber);
  }

  public clearInterval() {
    if (this.subscriptions) {
      this.subscriptions.map(sub => {
        sub.unsubscribe();
      });
    }
  }

  private logout() {
    this.dialog.closeAll();

    this.logoutService.logout();
  }

  private showSessionExpiredWarning() {
    this.dialog.open(
      SessionWarningDialogComponent,
      {
        hasBackdrop: true, disableClose: true,
        ariaLabel: 'session-alert-dialog'
      }
    );
  }

  getUserDetails(callback: Function) {

    this.http.get(
      `${this.URL_CONFIG.base}${this.URL_CONFIG.userDetails}`,
      {
        headers: {
          'Content-Security-Policy': "frame-ancestors 'none'"
        }
      }
    ).subscribe({
      next: (res: any) => {
        this.authService.createUserSession(res);
        this.status.toggleNavigation(true);

        callback && callback();
      },
      error: err => {
        console.log(err);
      }
    });
  }

}
