import { Injectable } from '@angular/core';
import { EventAction, EventStep } from 'src/app/pages/programs/event.model';
import { DialogMode } from 'src/app/pages/programs/program.model';
import { HttpService } from '../../http/http.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormService } from '../../form-service/form.service';
import { ResponseError } from 'src/app/core/models/pagination-response.model';
import { UntypedFormGroup } from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventActionService {
  private eventActionDialogConfigData: any = {};
  private reloadEventAction$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  private errorMessages = {};

  get reloadEventActionObservable(): Observable<boolean> {
    return this.reloadEventAction$.asObservable();
  }

  constructor(
    private httpService: HttpService,
    private activatedRoute: ActivatedRoute,
    private formService: FormService
  ) { }

  public emitReloadEventAction(reload: boolean): void {
    this.reloadEventAction$.next(reload);
  }

  public setEventActionDialogConfigData(
    dialogMode: DialogMode,
    eventAction: EventAction,
    openEventDialog: boolean,
    eventDialogConfigData: any,
    eventGroupDialogConfigData: any,
    eventDialogSelectedTab?: EventStep
  ) {
    this.clearEventActionDialogConfigData();

    this.eventActionDialogConfigData = {
      dialogMode: dialogMode,
      eventAction: eventAction,
      openEventDialog: openEventDialog,
      eventDialogConfigData: eventDialogConfigData,
      eventGroupDialogConfigData: eventGroupDialogConfigData,
      eventDialogSelectedTab: eventDialogSelectedTab,
    };
  }

  public getEventActionDialogConfigData() {
    return this.eventActionDialogConfigData;
  }

  public clearEventActionDialogConfigData() {
    this.eventActionDialogConfigData = {};
  }

  public updateErrorMessages(responseErrors: ResponseError[], formGroup: UntypedFormGroup) {
    const additionalErrors = this.formService.prepareErrorObject(responseErrors);

    this.errorMessages = { ...this.errorMessages, ...additionalErrors };

    this.formService.setResponseErrors(responseErrors, formGroup)
  }

  public getErrorMessage(form: UntypedFormGroup, fromControlName: string): string {
    return this.formService.getFormControlErrorMessage(
      form,
      fromControlName,
      this.errorMessages
    );
  }

  public getEndpoints() {
    const param = {
      communityCode: this.activatedRoute.snapshot.queryParams['client']
    };

    return this.httpService.get('api/v1/message/listActionEPMConfigs', param);
  }


  public getEndpointsMessageList() {
    const param = {
      communityCode: this.activatedRoute.snapshot.queryParams['client']
    }

    return this.httpService.get('api/v1/message/listActionDropdownEPMs', param);
  }

  public getEndpointsMessageDetailsList(
    selectedEndPointMsgId: any,
    communityCode?: string
  ) {
    const param = {
      communityCode: communityCode || this.activatedRoute.snapshot.queryParams['client']
    };

    return this.httpService.get(
      `api/v1/message/viewEndpointMessage/${selectedEndPointMsgId}`,
      param
    );
  }

  public getActionTypes() {
    return this.httpService.get('api/v1/reference/listActionTypes');
  }

  public getAmountTypes() {
    return this.httpService.get('api/v1/reference/listMerchantAmountTypes');
  }

  public getEventActionAccordionViewId(action: EventAction): string {
    return 'eventAction-' + action?.eventActionName + action?.id
  }

}
