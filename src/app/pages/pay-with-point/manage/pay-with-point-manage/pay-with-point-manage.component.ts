import { HttpStatusCode } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { ButtonColor, TabsOrientation } from '@visa/vds-angular';
import { Observable, Subject, distinctUntilChanged, map, takeUntil } from 'rxjs';
import { CLOSE, CONFIRM, CONFIRM_MESSAGE, EMPTY, WorkFlowAction } from 'src/app/core/constants';
import { DialogComponent } from 'src/app/core/dialog/dialog.component';
import { DialogConfig, DialogType } from 'src/app/core/dialog/dialog.model';
import { ButtonDirection } from 'src/app/core/models/dialog-button-direction.model';
import { Mode } from 'src/app/core/models/mode.model';
import { Module } from 'src/app/core/models/module.model';
import { PaginationResponse } from 'src/app/core/models/pagination-response.model';
import { STATUS_CODE_BY_STATUS, StatusCode } from 'src/app/core/models/status.model';
import { UserRole } from 'src/app/core/models/user.model';
import { AuthorizationService } from 'src/app/services/authorization.service';
import { CustomFormGroup, FormBuilder } from 'src/app/services/form-service/form.service';
import { GarbageCollectorService } from 'src/app/services/garbage-collector.service';
import { NavStatusService } from 'src/app/services/nav-status/nav-status.service';
import { PayWithPointService } from 'src/app/services/pay-with-point/pay-with-point.service';
import { ToggleAlertService } from 'src/app/services/toggle-alert/toggle-alert.service';
import { FunctionsService } from 'src/app/services/util/functions.service';
import { Utils } from 'src/app/services/utils';
import { SortDirection } from 'src/app/shared/search-table/search-table.model';
import { WorkflowConfirmDialogComponent } from 'src/app/shared/workflow-confirm-dialog/workflow-confirm-dialog.component';
import { WorkflowConfirmDialogConfig } from 'src/app/shared/workflow-confirm-dialog/workflow-confirm-dialog.model';
import { PayWithPointStep, Plan, RedemptionRestriction, TermsAndConditions } from '../../pwp-csr.model';
import { PayWithPointDetailsComponent } from '../../shared/details/pay-with-point-details/pay-with-point-details.component';

@Component({
  selector: 'app-pay-with-point-manage',
  templateUrl: './pay-with-point-manage.component.html',
  styleUrls: ['./pay-with-point-manage.component.scss']
})
export class PayWithPointManageComponent implements OnInit, OnDestroy {
  @ViewChild(PayWithPointDetailsComponent)
  detailComponent!: PayWithPointDetailsComponent;

  private destroy$ = new Subject<void>();


  protected readonly TabsOrientation = TabsOrientation;
  protected readonly ButtonColor = ButtonColor;
  protected readonly PayWithPointStep = PayWithPointStep;
  protected readonly Mode = Mode;


  protected readonly viewName = "pay-with-point-manage";
  protected readonly PAY_WITH_POINT = Module.PAY_WITH_POINT;
  protected readonly tabs: string[] = [
    PayWithPointStep.Details
  ];
  protected versionList: Plan[] = [];




  protected initialized: boolean = false;

  protected selectedTabIndex: number = 0;


  protected planForm: CustomFormGroup<Plan> = this.formBuilder.group(
    {
      ...new Plan(),
      termsAndConditions: this.formBuilder.group<TermsAndConditions>(new TermsAndConditions()),
      redemptionRestrictions: this.formBuilder.array([])
    }
  );

  protected versionFormControl = this.formBuilder.control({ value: null });


  get editable(): boolean {
    return (
      (this.authorizationService?.getUserRole() !== UserRole.CLIENT_READ_ONLY) &&
      ![
        StatusCode.INACTIVE,
        StatusCode.ARCHIVED,
        StatusCode.PENDING_APPROVAL
      ].includes(STATUS_CODE_BY_STATUS[this.plan.planStatus!])
    );
  }

  get previousVersionExist(): boolean {
    const plan: Plan = this.planForm.getRawValue() as Plan;

    if (
      (this.versionList?.length > 1) &&
      !!plan &&
      (
        (STATUS_CODE_BY_STATUS[this.plan.planStatus!] === StatusCode.DRAFT) ||
        (STATUS_CODE_BY_STATUS[this.plan.planStatus!] === StatusCode.PENDING_APPROVAL) ||
        (STATUS_CODE_BY_STATUS[this.plan.planStatus!] === StatusCode.REJECTED)
      )
    ) {
      return true;
    } else {
      return false;
    }
  }

  get plan(): Plan {
    return this.planForm.value;
  }

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private navStatusService: NavStatusService,
    private viewContainerRef: ViewContainerRef,
    private authorizationService: AuthorizationService,
    private alertService: ToggleAlertService,
    private dialog: MatDialog,
    protected functionService: FunctionsService,
    protected payWithPointService: PayWithPointService
  ) { }

  private setCurrentTab(index: number = this.tabs.indexOf(PayWithPointStep.Details)) {
    this.selectedTabIndex = index;
  }

  private setVersionList(
    planId: string,
    tenantEnrollmentId: string,
    defaultVersion?: string
  ) {
    this.versionList.length = 0;
    this.versionFormControl.reset();


    this.payWithPointService.getPlanVersionList(planId, tenantEnrollmentId).subscribe(res => {
      if (Utils.isNull(res.errors)) {
        this.versionList.push(...Utils.sortArray(res.data, 'version', SortDirection.DESC));

        this.versionFormControl.patchValue(defaultVersion);
      }
    });
  }

  private mapPlan(response: PaginationResponse<Plan>) {
    this.initialized = false;

    const planData: Plan = response.data;

    if (Utils.isNotNull(planData)) {
      this.planForm.patchValue(planData);
      this.planForm.markAsPristine();


      if (Utils.isNotNull(planData.redemptionRestrictions)) {
        const redemptionRestrictionFromArray: FormArray = this.planForm.controls.redemptionRestrictions as FormArray;

        redemptionRestrictionFromArray.controls = [];

        for (const redemptionRestriction of planData.redemptionRestrictions) {
          const redemptionRestrictionFormGroup: FormGroup = this.formBuilder.group(new RedemptionRestriction());
          redemptionRestrictionFormGroup.patchValue(redemptionRestriction);

          redemptionRestrictionFromArray.push(redemptionRestrictionFormGroup);
        }
      }


      setTimeout(() => this.initialized = true, 1000);
    }
  }

  private showSuccessMessage(isDelete: boolean = false) {
    this.alertService.showSuccessMessage(`${Module.PAY_WITH_POINT.name} ${isDelete ? 'deleted' : 'updated'} successfully.`);
  }

  private performStatusTransition(
    callback: Observable<PaginationResponse<Plan> | PaginationResponse<null>>,
    isDeleteRequest: boolean = false
  ): Observable<boolean> {
    return callback?.pipe(
      map(
        (response: PaginationResponse<Plan> | PaginationResponse<null>) => {
          if ((response.statusCode === HttpStatusCode.Ok) && Utils.isNull(response.errors)) {
            this.showSuccessMessage(isDeleteRequest);

            if (isDeleteRequest) {
              if (this.versionList?.length === 1) {
                setTimeout(() => {
                  this.payWithPointService.navigateToListPage();
                }, 1000);
              } else {
                this.setVersionList(this.plan.planId!, this.plan.tenantEnrollmentId!, (this.plan.version - 1).toString());
              }
            } else {
              this.performVersionSelection(this.plan.version);
            }

            return true;
          } else {
            this.payWithPointService.updateErrorMessages(response.errors, this.planForm);
            return false;

          }
        }));
  }

  private openConfirmDialog(
    title: string,
    callback: Observable<boolean>,
    buttonLabel: string = CONFIRM
  ) {
    this.dialog.open(
      DialogComponent,
      {
        width: '350px',
        disableClose: true,
        hasBackdrop: true,
        data: new DialogConfig(
          title,
          CONFIRM_MESSAGE,
          ButtonDirection.RIGHT,
          [
            {
              label: buttonLabel,
              color: ButtonColor.PRIMARY,
              click: (comp: DialogComponent) => {
                callback.subscribe(res => res && comp.close());
              }
            },
            {
              label: CLOSE,
              color: ButtonColor.SECONDARY,
              click: (comp: DialogComponent) => comp.close()
            }
          ],
          undefined,
          undefined,
          DialogType.CONFIRMATION
        )
      }
    );
  }


  private registerOnChangeListeners() {
    this.versionFormControl.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        distinctUntilChanged()
      ).subscribe(res => !!res && this.performVersionSelection(res));
  }

  protected onTabChange(event: any) {
    // this.navStatusService.togglePanel(false);
  }

  protected performVersionSelection(versionNumber: number) {
    this.initialized = false;

    const selectedVersion = this.versionList.find(ver => ver.version == versionNumber);

    this.payWithPointService.getPlanByVersion(
      versionNumber,
      selectedVersion?.planId!,
      selectedVersion?.tenantEnrollmentId!
    )
      .subscribe(response => {
        this.mapPlan(response);
      });
  }


  private openWorkflowConfirmDialog(workflow: WorkFlowAction, submitCallback: Function) {
    let title = EMPTY;

    if (workflow === WorkFlowAction.REJECT) {
      title = 'Reject Plan';
    }
    // if (workflow === WorkFlowAction.REJECT_DEACTIVATION) {
    //   title = 'Reason for Deactivation Rejection';
    // }
    // if (workflow === WorkFlowAction.SUBMIT_FOR_DEACTIVATE || workflow === WorkFlowAction.DEACTIVATE) {
    //   title = 'Reason for Deactivation'
    // }


    const dialogConfig: WorkflowConfirmDialogConfig = {
      title: title,
      confirm: (comment: string) => submitCallback(comment)
    };

    this.dialog.open(
      WorkflowConfirmDialogComponent,
      {
        hasBackdrop: true,
        disableClose: true,
        ariaLabel: 'pwp-workflow-confirm-dialog',
        width: '400px',
        data: dialogConfig,
      });
  }

  protected handleWorkflowChange(workFlowAction: WorkFlowAction) {
    const planId: string = this.plan.planId!;
    const tenantEnrollmentId: string = this.plan.tenantEnrollmentId!;

    if (WorkFlowAction.SUBMIT_FOR_APPROVAL === workFlowAction) {
      this.openConfirmDialog(
        'Submit for approval',
        this.performStatusTransition(this.payWithPointService.submitPlan(planId, tenantEnrollmentId)),
        'SUBMIT FOR APPROVAL'
      );
    } else if (WorkFlowAction.APPROVE === workFlowAction) {
      this.openConfirmDialog(
        'Approve Plan',
        this.performStatusTransition(this.payWithPointService.approvePlan(planId, tenantEnrollmentId)),
        'APPROVE'
      );
    } else if (WorkFlowAction.REJECT === workFlowAction) {
      this.openWorkflowConfirmDialog(
        workFlowAction,
        (comment: string) => this.performStatusTransition(this.payWithPointService.rejectPlan(planId, tenantEnrollmentId, comment))
      );
    } else if (WorkFlowAction.ARCHIVE === workFlowAction) {
      this.openConfirmDialog(
        'Archive Plan',
        this.performStatusTransition(this.payWithPointService.archivePlan(planId, tenantEnrollmentId)),
        'ARCHIVE'
      );
    } else if (WorkFlowAction.DEACTIVATE === workFlowAction) {
      this.openConfirmDialog(
        'Deactivate Plan',
        this.performStatusTransition(this.payWithPointService.deactivatePlan(planId, tenantEnrollmentId, this.plan.version)),
        'DEACTIVATE'
      );
    } else if (WorkFlowAction.DELETE === workFlowAction) {
      this.openConfirmDialog(
        'Delete Plan',
        this.performStatusTransition(this.payWithPointService.deletePayWithPoint(planId, tenantEnrollmentId), true),
        'DELETE'
      );
    }
  }

  protected handleSubmit(saveAndExit: boolean = false) {
    const isValid = this.detailComponent.validate();

    if (isValid) {
      this.payWithPointService.updatePayWithPoint(
        this.plan.planId,
        this.plan
      ).subscribe({
        next: response => {
          if ((response.statusCode === HttpStatusCode.Ok) && Utils.isNull(response.errors)) {
            this.alertService.showSuccessMessage(this.PAY_WITH_POINT.name.concat(' updated successfully.'));

            if (saveAndExit) {
              this.payWithPointService.navigateToListPage();
            } else {
              ;
              this.setVersionList(response?.data?.planId!, response?.data?.tenantEnrollmentId!, response?.data?.version?.toString());
            }

          } else {
            this.payWithPointService.updateErrorMessages(response.errors, this.planForm);
          }
        },
        error: err => {
          console.log(err);
        }
      });
    } else {
      this.alertService.showError();
    }
  }


  ngOnInit(): void {
    this.registerOnChangeListeners();

    this.setCurrentTab();

    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.setVersionList(
          params.get('planId')!,
          params.get('tenantEnrollmentId')!,
          params.get('version')!
        );
      });

    this.navStatusService.setOverlayStatus(true);
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    this.navStatusService.setOverlayStatus(false);


    GarbageCollectorService.clearDetachedDOMElements(
      this,
      this.viewContainerRef,
      true
    );
  }
}
