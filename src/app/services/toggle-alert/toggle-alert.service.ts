import { Injectable } from '@angular/core';
import { AlertType } from '@visa/vds-angular';
import { Subject } from 'rxjs';
import { EMPTY, ERROR_MESSAGE, SUCCESS, VALIDATION_FAIL_ERROR } from 'src/app/core/constants';
import { ResponseError } from 'src/app/core/models/pagination-response.model';
import { AlertConfig, AlertMode } from 'src/app/shared/alert-box/alert-box.model';

@Injectable({
  providedIn: 'root'
})
export class ToggleAlertService {
  private alertData: Subject<AlertConfig | undefined> = new Subject<
    AlertConfig | undefined
  >();

  constructor() { }

  public setAlertData(alertData: AlertConfig) {
    this.alertData.next(alertData);
  }

  public getAlertData() {
    return this.alertData.asObservable();
  }

  public showResponseErrors(responseErrors: ResponseError[], fullWidth: boolean = false) {
    this.setAlertData(
      {
      title: ERROR_MESSAGE,
      message: EMPTY,
      responseErrors: responseErrors,
      type: AlertType.ERROR,
      mode: fullWidth ? AlertMode.FULL_SCREEN : AlertMode.RESTRICTED_SCREEN
    });
  }

  public showError(message: string = VALIDATION_FAIL_ERROR, fullWidth: boolean = false) {
    this.setAlertData({
      title: ERROR_MESSAGE,
      message: message,
      type: AlertType.ERROR,
      mode: fullWidth ? AlertMode.FULL_SCREEN : AlertMode.RESTRICTED_SCREEN
    });
  }

  public showSuccessMessage(message: string, fullWidth: boolean = false) {
    this.setAlertData(
      {
        title: SUCCESS,
        message: message,
        type: AlertType.SUCCESS,
        mode: fullWidth ? AlertMode.FULL_SCREEN : AlertMode.RESTRICTED_SCREEN
      }
    )
  }
}
