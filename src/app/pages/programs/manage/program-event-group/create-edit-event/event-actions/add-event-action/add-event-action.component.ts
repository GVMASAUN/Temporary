import { AfterViewInit, Component, Inject, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import {
  ButtonColor,
  ButtonIconType,
  ComboboxType,
  RadioChange,
  TooltipPosition
} from '@visa/vds-angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EMPTY, SUCCESS_CODE, VisaIcon } from 'src/app/core/constants';
import { PaginationResponse, ResponseError } from 'src/app/core/models/pagination-response.model';
import { CreateEditEventGroupTemplateEventDialogComponent } from 'src/app/pages/event-group-template/shared/event-group-template-events/create-edit-event-group-template-event-dialog/create-edit-event-group-template-event-dialog.component';
import { EventAction, EventActionFulfillmentMonetaryType, EventActionType } from 'src/app/pages/programs/event.model';
import {
  DialogMode
} from 'src/app/pages/programs/program.model';
import { FormService } from 'src/app/services/form-service/form.service';
import { GarbageCollectorService } from 'src/app/services/garbage-collector.service';
import { HttpService } from 'src/app/services/http/http.service';
import { EventActionService } from 'src/app/services/program/event-action/event-action.service';
import { ToggleAlertService } from 'src/app/services/toggle-alert/toggle-alert.service';
import { Utils } from 'src/app/services/utils';
import { CreateEditEventComponent } from '../../create-edit-event.component';
import { EventGroupTemplateService } from 'src/app/services/event-group-template.service';
import { DialogService } from 'src/app/services/dialog/dialog.service';

@Component({
  selector: 'app-add-event-action',
  templateUrl: './add-event-action.component.html',
  styleUrls: ['./add-event-action.component.scss']
})
export class AddEventActionComponent implements OnInit, AfterViewInit, OnDestroy {
  private destroy$ = new Subject<void>();

  buttonColor = ButtonColor;
  buttonIconType = ButtonIconType;
  comboboxType = ComboboxType;
  tooltipPosition = TooltipPosition;
  DialogMode = DialogMode;
  VisaIcon = VisaIcon;
  EventActionFulfillmentMonetaryType = EventActionFulfillmentMonetaryType;

  actionDetail: EventAction | null = null;

  actionType: string = EMPTY;
  selectedEndpoint: string = EMPTY;
  selectedEndPointMsgId: string = EMPTY;

  // selectedRow: number = 0;

  openEventDialog: boolean = true;
  isOpenedFromEventTemplate: boolean = false;
  endpointMessageNameLocked: boolean = false;
  customFieldValuesLocked: boolean = false;
  initTransactionAttributes: boolean = false;

  actionForm = this.fb.group({
    eventActionName: [EMPTY],
    type: [EMPTY],
    endpointUrl: [EMPTY],
    selectedEndPointMsgId: [EMPTY]
  });

  notificationDelayValue = this.fb.group({
    days: 0,
    hours: 0,
    minutes: 0
  });

  statementCreditForm = this.fb.group({
    merchantDescriptor: [EMPTY],
    merchantCity: [EMPTY],
    reward: [EventActionFulfillmentMonetaryType.Fixed]
  });

  dialogMode = this.DialogMode.CREATE;

  parentDialogData: any;

  actionTypeList: any[] = [];
  endPointList: any[] = [];
  endPointMessageList: any[] = [];
  systemFieldsList: string[] = [];

  userFieldsList: { key: string; value: string }[] = [];

  amountTypeList: { id: string; name: string }[] = [];

  get statementCredit(): any {
    return this.statementCreditForm.getRawValue();
  }

  constructor(
    private fb: UntypedFormBuilder,
    private viewContainerRef: ViewContainerRef,
    private http: HttpService,
    private route: ActivatedRoute,
    private toggleAlertService: ToggleAlertService,
    private eventActionService: EventActionService,
    private eventGroupTemplateService: EventGroupTemplateService,
    private formService: FormService,
    private dialog: MatDialog,
    private dialogService: DialogService,
    private dialogRef: MatDialogRef<AddEventActionComponent>,
    @Inject(MAT_DIALOG_DATA) private dialogConfig: any

  ) {
    this.dialogService.setDialogEventListeners(
      this.dialogRef,
      () => { this.close(false); }
    ).pipe(takeUntil(this.destroy$)).subscribe();
  }

  get disabled(): boolean {
    return this.dialogMode === DialogMode.VIEW;
  }

  ngOnInit(): void {
    this.eventActionService.emitReloadEventAction(false);

    const dialogData = this.eventActionService.getEventActionDialogConfigData();

    this.parentDialogData = dialogData.eventDialogConfigData;
    this.dialogMode = dialogData.dialogMode;
    this.actionDetail = dialogData.eventAction || null;
    this.openEventDialog = !!dialogData.openEventDialog;
    this.isOpenedFromEventTemplate = this.dialogConfig?.isOpenedFromEventTemplate;

    console.log(this.actionDetail);

    this.init();
  }

  ngAfterViewInit(): void {
    this.formService.clearFormControlValidators(this.actionForm);
  }

  private init() {
    if (this.actionDetail) {
      this.endpointMessageNameLocked = this.actionDetail.endpointMessageNameLocked;
      this.customFieldValuesLocked = this.actionDetail.customFieldValuesLocked;

      this.notificationDelayValue.patchValue(
        this.actionDetail.notificationDelayValue || {
          days: 0,
          hours: 0,
          minutes: 0
        }
      );
      this.statementCreditForm.patchValue({
        merchantDescriptor: this.actionDetail.merchantDescriptor || EMPTY,
        merchantCity: this.actionDetail.merchantCity || EMPTY,
        reward: this.actionDetail.fulfillmentMonetaryType || EventActionFulfillmentMonetaryType.Fixed
      });
    }

    this.getActionFormData();
  }

  private preFillForm() {
    if (this.actionDetail) {
      this.actionForm.patchValue({
        eventActionName: this.actionDetail.actionName || this.actionDetail.eventActionName,
        type: this.actionDetail.eventActionTypeId,
        endpointUrl: this.actionDetail.endpointUrlName
      });


      this.typeChanged({
        target: {
          value: this.actionDetail.eventActionTypeId!.toString()
        }
      },
        'actionType'
      );
    }
  }

  private getActionFormData() {
    this.http.get('api/v1/reference/listActionTypes')
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (res: any) => {
          res = JSON.parse(res.body);
          this.actionTypeList = res.data;
          this.actionForm.get('type')?.setValue(EMPTY);
          this.actionForm.get('type')?.setErrors(null);

          this.preFillForm();
        },
        error: err => {
          console.log(err);
        }
      });
  }

  private getEndpointsList() {
    const param = {
      communityCode: this.route.snapshot.queryParams['client']
    };
    this.http.get('api/v1/message/listActionEPMConfigs', param)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (res: any) => {
          res = JSON.parse(res.body);
          this.endPointList = res.communityEndPoints;

          if (this.actionDetail) {
            this.selectedEndpoint = this.actionDetail.endpointUrlName || EMPTY;

            setTimeout(() => {
              this.actionForm.get("endpointUrl")?.patchValue(this.selectedEndpoint);
            }, 20);
          }
        },
        error: err => {
          console.log(err);
        }
      });
  }

  private getEndpointsMessageList() {
    const param = {
      communityCode: this.isOpenedFromEventTemplate ? this.parentDialogData.event.communityCode : this.route.snapshot.queryParams['client'],
    };

    this.http.get('api/v1/message/listActionDropdownEPMs', param)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (res: any) => {
          res = JSON.parse(res.body);

          if (this.actionDetail) {
            this.selectedEndPointMsgId = this.actionDetail!.endpointMessageId!;
          }

          this.endPointMessageList = res.data;
        },
        error: err => {
          console.log(err);
        }
      });
  }

  private getEndpointsMessageDetailsList() {
    const param = {
      communityCode: this.isOpenedFromEventTemplate ? this.parentDialogData.event.communityCode : this.route.snapshot.queryParams['client'],
    };

    this.http
      .get(
        'api/v1/message/viewEndpointMessage/' + this.selectedEndPointMsgId,
        param
      ).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.userFieldsList = [];

          res = JSON.parse(res.body);
          this.systemFieldsList = res.data.systemDefinedField.split(',');
          if (this.actionDetail) {
            res.data.userDefinedField?.split(',').map((field: string) => {
              let indx = this.actionDetail?.customFieldValueList?.findIndex(
                s => s.key == field
              )!;

              this.userFieldsList.push({
                key: field,
                value:
                  this.actionDetail?.customFieldValueList![indx]?.value || EMPTY
              });
            });
          } else {
            res.data.userDefinedField?.split(',').map((field: string) => {
              this.userFieldsList.push({ key: field, value: EMPTY });
            });
          }
        },
        error: err => {
          console.log(err);
        }
      });
  }

  private getAmountType() {
    this.initTransactionAttributes = false;

    this.http.get('api/v1/reference/listMerchantAmountTypes').pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          res = JSON.parse(res.body);
          this.amountTypeList = res;
          this.statementCreditForm
            .get('amountType')
            ?.setValue(this.actionDetail?.amountType || EMPTY);
          this.statementCreditForm
            .get('amountType')
            ?.setErrors(null);

          this.initTransactionAttributes = true;

        },
        error: err => {
          console.log(err);
        }
      });
  }

  private getActionFormValidationMap(): Map<AbstractControl | null, ValidatorFn | Array<ValidatorFn> | null> {
    const formValidationMap = new Map<AbstractControl | null, ValidatorFn | Array<ValidatorFn> | null>();

    formValidationMap.set(this.actionForm.get('eventActionName'),
      [Validators.required]
    );

    formValidationMap.set(this.actionForm.get('type'),
      [Validators.required]
    );

    formValidationMap.set(this.actionForm.get('endpointUrl'),
      (!this.isOpenedFromEventTemplate && (EventActionType.StatementCredit !== this.actionType)) ? [Validators.required] : null
    );

    formValidationMap.set(this.actionForm.get('selectedEndPointMsgId'),
      (EventActionType.StatementCredit !== this.actionType) ? [Validators.required] : null
    );


    return formValidationMap;
  }

  private getStatementCreditFormValidationMap(): Map<AbstractControl | null, ValidatorFn | Array<ValidatorFn> | null> {
    const formValidationMap = new Map<AbstractControl | null, ValidatorFn | Array<ValidatorFn> | null>();

    if (!this.isOpenedFromEventTemplate && this.actionType === EventActionType.StatementCredit) {
      formValidationMap.set(this.statementCreditForm.get('merchantDescriptor'),
        [Validators.required]
      );

      formValidationMap.set(this.statementCreditForm.get('reward'),
        [Validators.required]
      );

      formValidationMap.set(this.statementCreditForm.get('fulfillmentConstraint'),
        this.statementCredit?.reward === EventActionFulfillmentMonetaryType.Pct
          ? [Validators.required]
          : null
      );

      formValidationMap.set(this.statementCreditForm.get('amountType'),
        this.statementCredit?.reward === EventActionFulfillmentMonetaryType.Pct
          ? [Validators.required]
          : null
      );

      formValidationMap.set(this.statementCreditForm.get('fulfillmentMonetaryValue'),
        // this.statementCredit?.reward === EventActionFulfillmentMonetaryType.Fixed
        // ? 
        [Validators.required]
        // : null
      );
    }


    return formValidationMap;
  }

  private initDialogConfigs(res: PaginationResponse<any>) {
    this.actionDetail = res.data;
    if (this.actionDetail) {
      this.init();
    }
    this.dialogMode = DialogMode.EDIT;
  }

  private createOrUpdateEventAction(isSaveAndExit: boolean) {
    const isActionFormValid = this.formService.validate(this.getActionFormValidationMap());
    const isStatementCreditFormValid = this.formService.validate(this.getStatementCreditFormValidationMap());

    if (isActionFormValid && isStatementCreditFormValid) {
      let param: any = {
        eventStageId: this.isOpenedFromEventTemplate ? this.parentDialogData.event.eventTemplateId : this.parentDialogData.event.eventStageId,
        communityCode: this.isOpenedFromEventTemplate ? this.parentDialogData.event.communityCode : this.route.snapshot.queryParams['client'],
        eventActionName: this.actionForm.get('eventActionName')?.value,
        eventActionTypeId: this.actionForm.get('type')?.value
      };

      let api = EMPTY;
      let requestType: 'post' | 'put';

      if (this.actionType.includes('Endpoint')) {
        const notiDelayObj = this.notificationDelayValue.getRawValue();
        notiDelayObj['days'] = parseFloat(notiDelayObj['days']);
        notiDelayObj['hours'] = parseFloat(notiDelayObj['hours']);
        notiDelayObj['minutes'] = parseFloat(notiDelayObj['minutes']);

        api = this.isOpenedFromEventTemplate ? 'api/v1/event/template/actionEPMMessage' : 'api/v1/event/actionEPMMessage';
        param = {
          ...param,
          endpointMessageId: this.selectedEndPointMsgId,
          endpointUrlName: this.selectedEndpoint,
          customFieldValueList: this.userFieldsList,
          endpointMessageNameLocked: this.endpointMessageNameLocked,
          customFieldValuesLocked: this.customFieldValuesLocked,

          ...(JSON.stringify(notiDelayObj) !=
            JSON.stringify({ days: 0, hours: 0, minutes: 0 }) && {
            notificationDelayValue: notiDelayObj
          })
          // notifyMessageFirst: EMPTY,
          // notifyMessageEvery: EMPTY,
          // notifyMessageMax: 0,
          // uiStructurePos: EMPTY
        };
      } else if (this.actionType == 'Statement Credit') {
        const sc = this.statementCreditForm.getRawValue();
        api = this.isOpenedFromEventTemplate ? 'api/v1/event/template/actionStatementCredit' : 'api/v1/event/actionStatementCredit';
        param = {
          ...param,
          fulfillmentMonetaryType: sc.reward,
          ...(!this.isOpenedFromEventTemplate
            ?
            {
              ...(sc.reward == EventActionFulfillmentMonetaryType.Fixed
                ? {
                  fulfillmentMonetaryValue: parseFloat(sc.fulfillmentMonetaryValue).toFixed(2),
                  fulfillmentConstraint: null,
                  amountType: EMPTY
                }
                : {
                  fulfillmentMonetaryValue: sc.fulfillmentMonetaryValue,
                  fulfillmentConstraint: parseFloat(sc.fulfillmentConstraint).toFixed(2),
                  amountType: sc.amountType
                }
              ),
              merchantDescriptor: sc.merchantDescriptor,
              ...(sc.merchantCity && { merchantCity: sc.merchantCity }),
            }
            : {}
          )
        };
      }

      if (this.dialogMode == this.DialogMode.CREATE) {
        requestType = 'post';
      } else {
        requestType = 'put';
        api += `/${this.actionDetail?.id}`;
        param['versionNumber'] = this.actionDetail!.versionNumber;
      }

      this.http[requestType](api, param).pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: any) => {
          const res = JSON.parse(response.body) as PaginationResponse<any>;
          if ((res.statusCode === SUCCESS_CODE) && Utils.isNull(res.errors)) {
            this.eventActionService.emitReloadEventAction(true);

            this.setAlertMessage();
            if (isSaveAndExit) {
              this.close(true);
            }
            else {
              this.initDialogConfigs(res);
            }
          } else {
            this.setErrorMessages(res.errors);
          }
        },
        error: err => {
          console.log(err);
        }
      });
    }else{
      this.toggleAlertService.showError();
    }

  }

  getErrorMessage(from: UntypedFormGroup, controlName: string): string {
    return this.eventActionService.getErrorMessage(from, controlName);
  }

  typeChanged(event: any, type: 'actionType' | 'endpointUrl') {
    if (event) {
      const typeId = event.target.value;


      if (type == 'actionType') {
        this.actionType = this.actionTypeList.filter(
          option => option.referenceId == typeId
        )[0].referenceDescription;


        if (this.actionType.includes('Endpoint')) {
          if (!this.isOpenedFromEventTemplate) { // VLS-261
            this.getEndpointsList();
          }

          this.getEndpointsMessageList();
        } else if (this.actionType == 'Statement Credit') {
          if (this.actionDetail) {
            this.selectReward({
              value: this.actionDetail.fulfillmentMonetaryType,
              source: undefined as any
            });
          } else {
            this.selectReward({ value: EventActionFulfillmentMonetaryType.Fixed, source: undefined as any });
          }
        }


        setTimeout(() => {
          this.actionForm.get('endpointUrl')?.clearValidators();
          this.actionForm.get('endpointUrl')?.updateValueAndValidity();
        }, 2);

      } else {
        this.selectedEndpoint = typeId;

        setTimeout(() => {
          this.actionForm.get("endpointUrl")?.patchValue(this.selectedEndpoint);
        }, 20);
      }
    }
  }

  selectMessage(e: string[]) {
    this.selectedEndPointMsgId = e.join();
    this.getEndpointsMessageDetailsList();
    this.actionForm.get('selectedEndPointMsgId')?.patchValue(this.selectedEndPointMsgId);
  }

  // notificationDelay(e: Event, value: string) {
  //   if (!(e instanceof InputEvent)) {
  //     this.notificationDelayValue
  //       .get(value)
  //       ?.setValue((e.target as HTMLInputElement).value);
  //   }
  // }

  addCustomField(e: Event, index: number) {
    this.userFieldsList[index].value = (e.target as HTMLInputElement).value;
  }

  selectReward(e: RadioChange) {
    if (!this.isOpenedFromEventTemplate) {

      this.statementCreditForm.addControl(
        'fulfillmentMonetaryValue',
        this.fb.control(
          this.actionDetail?.fulfillmentMonetaryValue || EMPTY,
          // Validators.required
        )
      );

      if (e.value == EventActionFulfillmentMonetaryType.Fixed) {
        this.statementCreditForm.removeControl('amountType');
        this.statementCreditForm.removeControl('fulfillmentConstraint');
      } else {

        this.statementCreditForm.addControl(
          'amountType',
          this.fb.control(
            this.actionDetail?.amountType || EMPTY,
            // Validators.required
          )
        );

        this.statementCreditForm.addControl('fulfillmentConstraint', this.fb.control(EMPTY));
        if (!isNaN(this.actionDetail?.fulfillmentConstraint)) {
          this.statementCreditForm
            .get('fulfillmentConstraint')
            ?.setValue(this.actionDetail?.fulfillmentConstraint);
        }

        this.getAmountType();
      }
    }

    setTimeout(() => {
      this.formService.clearFormControlValidators(this.actionForm);
    }, 0);
  }

  private setErrorMessages(responseErrors: ResponseError[]) {
    this.toggleAlertService.showResponseErrors(responseErrors);
    this.eventActionService.updateErrorMessages(responseErrors, this.actionForm);
    this.eventActionService.updateErrorMessages(responseErrors, this.statementCreditForm);
  }

  setAlertMessage() {
    this.toggleAlertService.showSuccessMessage(
      this.dialogMode === DialogMode.CREATE
        ? `Event Action added successfully.`
        : `Event Action updated successfully.`
    );
  }

  save() {
    this.createOrUpdateEventAction(false);
  }

  saveAndExit() {
    this.createOrUpdateEventAction(true);
  }

  close(openManageProgram = true) {
    if (this.openEventDialog) {
      this.dialogRef.close();

      if (!!this.isOpenedFromEventTemplate) {
        this.dialog.open(CreateEditEventGroupTemplateEventDialogComponent,
          {
            hasBackdrop: true, disableClose: true,
            width: "1250px",
            ariaLabel: 'create-edit-template-dialog'
          });
      } else {
        this.dialog.open(CreateEditEventComponent,
          {
            hasBackdrop: true, disableClose: true,
            width: "1250px",
            ariaLabel: 'create-edit-event-dialog'
          });
      }

    } else {
      this.dialogRef.close();
    }
  }

  ngOnDestroy(): void {
    this.eventActionService.emitReloadEventAction(false);

    this.destroy$.next();
    this.destroy$.complete();

    GarbageCollectorService.clearDetachedDOMElements(
      this,
      this.viewContainerRef
    );
  }
}