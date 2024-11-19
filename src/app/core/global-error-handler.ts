import { ErrorHandler, Injectable } from '@angular/core';
import { ApiConfigService } from '../services/api-config.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {

    constructor(private env: ApiConfigService) { }
    
    handleError(error: any): void {
        console.error(error);

        const chunkFailedMessage = /Loading chunk [\d]+ failed/;

        if (chunkFailedMessage.test(error?.message)) {
            // window.location.reload();
            window.location.href = this.env.getUrls().baseUrl + "login.html?redirect=true"; // redirecting to login
        }
    }
}