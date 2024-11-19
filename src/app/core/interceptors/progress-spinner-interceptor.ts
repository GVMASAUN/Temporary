import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, finalize } from "rxjs";
import { ProgressSpinnerService } from "src/app/shared/progress-spinner/progress-spinner.service";

@Injectable()
export class ProgressSpinnerInterceptor implements HttpInterceptor {

    private totalRequests: number = 0;

    constructor(
        private progressSpinnerService: ProgressSpinnerService
    ) { }

    intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        this.totalRequests++;
        this.progressSpinnerService.setProgressSpinnerVisibilty(true);

        return next.handle(request).pipe(
            finalize(() => {
                this.totalRequests--;
                if (this.totalRequests === 0) {
                    this.progressSpinnerService.setProgressSpinnerVisibilty(false);
                }
            })
        );
    }
}