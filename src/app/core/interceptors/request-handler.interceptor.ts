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
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AlertType } from '@visa/vds-angular';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Utils } from 'src/app/services/utils';
import { LoginService } from '../../services/login/login.service';
import { ToggleAlertService } from '../../services/toggle-alert/toggle-alert.service';
import { ERROR_MESSAGE } from '../constants';
import { PaginationResponse } from '../models/pagination-response.model';
import { ApiConfigService } from 'src/app/services/api-config.service';

@Injectable()
export class RequestHandlerInterceptor implements HttpInterceptor {
  constructor(
    private alert: ToggleAlertService,
    private router: Router,
    private loginService: LoginService,
    private dialog: MatDialog,
    private env: ApiConfigService
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

          const bodyResponse = res.body as PaginationResponse<any>;

          if (!!bodyResponse) {
            if ((bodyResponse?.statusCode !== HttpStatusCode.Ok) && Utils.isNotNull(bodyResponse?.errors)) {
              this.alert.showResponseErrors(bodyResponse.errors);
            }
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
        } else if (err.status === 0) {
           console.error('Network error or CORS error detected.');
           console.error(err); 
           window.location.href = this.env.getUrls().baseUrl + "login.html?redirect=true"; // redirecting to login
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
