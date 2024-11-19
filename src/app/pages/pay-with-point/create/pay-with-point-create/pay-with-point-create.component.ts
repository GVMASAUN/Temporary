import { HttpStatusCode } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ButtonColor, TabsOrientation } from '@visa/vds-angular';
import { Subject } from 'rxjs';
import { Mode } from 'src/app/core/models/mode.model';
import { Module } from 'src/app/core/models/module.model';
import { UserRole } from 'src/app/core/models/user.model';
import { AuthorizationService } from 'src/app/services/authorization.service';
import { CustomFormGroup, FormBuilder } from 'src/app/services/form-service/form.service';
import { GarbageCollectorService } from 'src/app/services/garbage-collector.service';
import { NavStatusService } from 'src/app/services/nav-status/nav-status.service';
import { PayWithPointService } from 'src/app/services/pay-with-point/pay-with-point.service';
import { ToggleAlertService } from 'src/app/services/toggle-alert/toggle-alert.service';
import { FunctionsService } from 'src/app/services/util/functions.service';
import { Utils } from 'src/app/services/utils';
import { PayWithPointStep, Plan, RedemptionRestriction, TermsAndConditions } from '../../pwp-csr.model';
import { PayWithPointDetailsComponent } from '../../shared/details/pay-with-point-details/pay-with-point-details.component';

@Component({
  selector: 'app-pay-with-point-create',
  templateUrl: './pay-with-point-create.component.html',
  styleUrls: ['./pay-with-point-create.component.scss']
})
export class PayWithPointCreateComponent implements OnInit, OnDestroy {
  @ViewChild(PayWithPointDetailsComponent)
  detailComponent!: PayWithPointDetailsComponent;

  private destroy$ = new Subject<void>();

  protected readonly TabsOrientation = TabsOrientation;
  protected readonly ButtonColor = ButtonColor;
  protected readonly PayWithPointStep = PayWithPointStep;
  protected readonly Mode = Mode;


  protected readonly viewName = "pay-with-point-create";
  protected readonly PAY_WITH_POINT = Module.PAY_WITH_POINT;


  protected planForm: CustomFormGroup<Plan> = this.formBuilder.group(
    {
      ...new Plan(),
      termsAndConditions: this.formBuilder.group<TermsAndConditions>(new TermsAndConditions()),
      redemptionRestrictions: this.formBuilder.array([this.formBuilder.group(new RedemptionRestriction('MCC'))])
    });

  protected tabs: string[] = [
    PayWithPointStep.Details
  ];


  protected initialized: boolean = false;

  protected selectedTabIndex: number = 0;

  get editable(): boolean {
    return this.authorizationService?.getUserRole() !== UserRole.CLIENT_READ_ONLY;
  }

  constructor(
    private formBuilder: FormBuilder,
    private alertService: ToggleAlertService,
    private navStatusService: NavStatusService,
    private viewContainerRef: ViewContainerRef,
    private authorizationService: AuthorizationService,
    protected functionService: FunctionsService,
    protected payWithPointService: PayWithPointService,
  ) { }

  private setCurrentTab(index: number = this.tabs.indexOf(PayWithPointStep.Details)) {
    this.selectedTabIndex = index;
  }

  protected onTabChange() {
    this.navStatusService.togglePanel(false);
  }

  protected handleSubmit(saveAndExit: boolean = false) {
    const isValid = this.detailComponent.validate();

    if (isValid) {
      this.payWithPointService.createPayWithPoint(
        this.planForm.value
      ).subscribe({
        next: response => {
          if ((response.statusCode === HttpStatusCode.Ok) && Utils.isNull(response.errors)) {
            this.alertService.showSuccessMessage(this.PAY_WITH_POINT.name.concat(' added successfully.'));

            if (saveAndExit) {
              this.payWithPointService.navigateToListPage();
            } else {
              this.payWithPointService.navigateToManagePage(response.data);
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
    this.navStatusService.setOverlayStatus(true);

    this.setCurrentTab();
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
