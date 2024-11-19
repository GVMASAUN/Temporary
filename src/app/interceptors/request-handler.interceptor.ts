import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
  HttpStatusCode
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AlertType } from '@visa/vds-angular';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ERROR_MESSAGE } from '../core/constants';
import { LoginService } from '../services/login/login.service';
import { ToggleAlertService } from '../services/toggle-alert/toggle-alert.service';
import { MatDialog } from '@angular/material/dialog';

@Injectable()
export class RequestHandlerInterceptor implements HttpInterceptor {
  constructor(
    private alert: ToggleAlertService,
    private router: Router,
    private loginService: LoginService,
    private dialog: MatDialog
  ) { }

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      tap(res => {
        if (res instanceof HttpResponse) {
          // if (res.url?.split('/').pop() == 'login') {
          //   this.dialog.closeAll();

          //   this.router.navigate(['/login']);
          // }

          if (res.url?.split('/').pop() === 'logout') {
            this.loginService.clearInterval();
          } else {
            this.loginService.setInterval();
          }
        }
      }),

      catchError((err: HttpErrorResponse) => {
        if (err.status === HttpStatusCode.Unauthorized) {
          this.loginService.clearInterval();
          this.dialog.closeAll();

          this.router.navigate(['login']);
        } else if (err.status === HttpStatusCode.Forbidden) {
          this.alert.showError("No access to resources.");
        } else {
          const error = err?.error;

          let errObj = (typeof err?.error === 'string') ? JSON.parse(error) : error;

          this.alert.setAlertData({
            title: ERROR_MESSAGE,
            message: JSON.stringify(errObj?.message || err.error || err.message),
            type: AlertType.ERROR
          });
        }

        return throwError(err);
      })
    );
  }
}
