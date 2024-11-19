import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { AbstractControl, FormArray, ValidatorFn, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { TooltipPosition } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { AccordionComponent, AlertType, BadgeType, ButtonColor, ButtonIconType, ButtonType } from '@visa/vds-angular';
import { Subject, Subscription, distinctUntilChanged, forkJoin, map, takeUntil } from 'rxjs';
import { CONFIRM_MESSAGE, EMPTY, LABEL, TimeZone, VisaIcon, VisaImage, WorkFlowAction } from 'src/app/core/constants';
import { DialogComponent } from 'src/app/core/dialog/dialog.component';
import { DialogConfig, DialogType } from 'src/app/core/dialog/dialog.model';
import { ButtonDirection } from 'src/app/core/models/dialog-button-direction.model';
import { Mode } from 'src/app/core/models/mode.model';
import { Option } from 'src/app/core/models/option.model';
import { STATUS_CODE_BY_STATUS, StatusCode } from 'src/app/core/models/status.model';
import { UserRole } from 'src/app/core/models/user.model';
import { EnrollmentCollection } from 'src/app/pages/enrollment-collection/enrollment-collection.model';
import { AuthorizationService } from 'src/app/services/authorization.service';
import { EnrollmentCollectionService } from 'src/app/services/enrollment-collection/enrollment-collection.service';
import { CustomFormGroup, CustomValidator, FormService } from 'src/app/services/form-service/form.service';
import { PayWithPointService } from 'src/app/services/pay-with-point/pay-with-point.service';
import { FunctionsService } from 'src/app/services/util/functions.service';
import { Utils } from 'src/app/services/utils';
import { SearchTableComponent } from 'src/app/shared/search-table/search-table.component';
import { SearchTableAction, SearchTableColumn, SearchTableColumnType, SortType } from 'src/app/shared/search-table/search-table.model';
import { MerchantCategoryCode, Plan, RedemptionRestriction, StatementCreditSource, Tenant, TenantType, TermsAndConditions } from '../../../pwp-csr.model';
import { AddMerchantCodeDialogComponent } from './add-merchant-code-dialog/add-merchant-code-dialog.component';
import { CreateEnrollmentCollectionDialogComponent } from './create-enrollment-collection-dialog/create-enrollment-collection-dialog.component';

@Component({
  selector: 'app-pay-with-point-details',
  templateUrl: './pay-with-point-details.component.html',
  styleUrls: ['./pay-with-point-details.component.scss']
})
export class PayWithPointDetailsComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChildren(AccordionComponent)
  accordions!: QueryList<AccordionComponent>;

  @Input()
  mode: Mode = Mode.Create;

  @Input()
  disabled: boolean = false;

  @Input()
  previousVersionExist: boolean = false;

  @Input()
  planForm!: CustomFormGroup<Plan>;

  @Output()
  workflowChangeEmitter: EventEmitter<WorkFlowAction> = new EventEmitter();

  private destroy$ = new Subject<void>();

  private merchantCategoryCodes: MerchantCategoryCode[] = [];
  private formControlSubscriptions: Subscription[] = [];
  private tenantList!: Tenant[];

  protected readonly BadgeType = BadgeType;
  protected readonly ButtonIconType = ButtonIconType;
  protected readonly ButtonType = ButtonType;
  protected readonly VisaIcon = VisaIcon;
  protected readonly VisaImage = VisaImage;
  protected readonly AlertType = AlertType;

  protected readonly StatusCode = StatusCode;
  protected readonly StatementCreditSource = StatementCreditSource;
  protected readonly Mode = Mode;
  protected readonly WorkFlowAction = WorkFlowAction;
  protected readonly UserRole = UserRole;
  protected readonly SortType = SortType;
  protected readonly TimeZone = TimeZone;


  protected readonly tooltipPosition: TooltipPosition = 'above';


  protected termsAndConditionForm!: CustomFormGroup<TermsAndConditions>;

  protected isDataLoaded: boolean = false;
  protected userRole!: UserRole;



  protected mccDataSource: MerchantCategoryCode[] = [];
  protected currencies: Option[] = [];
  protected tenants: Option[] = [];
  protected subTenants: Option[] = [];
  protected enrolmentCollections: Option[] = [];
  protected endpointTemplates: Option[] = [];
  protected notificationTemplates: Option[] = [];
  protected fulfillmentTemplates: Option[] = [];
  protected statementCreditSources: Option[] = [
    new Option(StatementCreditSource.Visa, StatementCreditSource.Visa),
    new Option(StatementCreditSource.Client, StatementCreditSource.Client)
  ];

  protected redemptionRestrictions: Option[] = [
    new Option('MCC', 'Merchant Category Code'),
  ];

  protected mccTableColumns: ReadonlyArray<SearchTableColumn> = [
    {
      key: 'serialNo',
      label: 'No.',
      type: SearchTableColumnType.SERIAL_NUMBER,
      sortable: false
    },
    {
      key: 'mrchCatgCd',
      label: 'Merchant Category Code'
    },
    {
      key: 'mrchCatgNm',
      label: 'Merchant Category Name'
    }
  ];

  protected mccTableActions: SearchTableAction[] = [
    {
      label: 'ADD MCCs',
      buttonColor: ButtonColor.PRIMARY,
      disabled: (table: SearchTableComponent) => !!table.selection.selected.length,
      click: (table: SearchTableComponent) => this.openMerchantCodeModal()
    },
    {
      label: 'REMOVE MCCs',
      buttonColor: ButtonColor.SECONDARY,
      disabled: (table: SearchTableComponent) => !table.selection.selected.length,
      click: (table: SearchTableComponent) => this.deleteMerchantCodes(table.selection.selected)
    }
  ];

  get plan(): Plan {
    return this.planForm.getRawValue();
  }

  get planStatusCode(): StatusCode {
    return STATUS_CODE_BY_STATUS[this.planForm?.value?.planStatus!] || StatusCode.DRAFT;
  }


  get redemptionRestrictionFormGroup(): CustomFormGroup<RedemptionRestriction> {
    const formArray = this.planForm.controls.redemptionRestrictions as FormArray<CustomFormGroup<RedemptionRestriction>>;

    return formArray.at(0);
  }

  get hasPwpRole(): boolean {
    return (
      (this.userRole === UserRole.VISA_REGIONAL_ADMIN_WITH_PAY_WITH_POINTS) ||
      (this.userRole === UserRole.VISA_CLIENT_ADMIN_WITH_PAY_WITH_POINTS) ||
      (this.userRole === UserRole.VISA_GLOBAL_ADMIN)
    );
  }

  get disabledApproveOrReject(): boolean {
    return (this.authService?.getUserId() === this.plan?.modifiedBy);
  }

  constructor(
    private formService: FormService,
    private dialog: MatDialog,
    private functionService: FunctionsService,
    private authService: AuthorizationService,
    protected payWithPointService: PayWithPointService,
    protected router: Router,
    protected enrollmentCollectionService: EnrollmentCollectionService
  ) {
    this.userRole = this.authService.getUserRole();
  }

  private setMerchantCategoryCodes() {
    return this.payWithPointService.getMerchantCategoryCodes()
      .pipe(
        map(response => {
          if (Utils.isNotNull(response.data)) {
            this.merchantCategoryCodes.push(...this.sortMerchantCodes(response.data));
          }
        }));
  }


  private setCurrencies() {
    return this.payWithPointService.getCurrencies()
      .pipe(
        map(response => {

          if (Utils.isNotNull(response.data)) {
            this.currencies.push(...response.data.map(cur => new Option(cur.currCdAlphaCd, cur.currCdAlphaCd)));
          }
        }));
  }

  private mapSubTenant() {
    const tenant = this.tenantList.find(ten => ten.tenantEnrollmentId === this.plan.tenantEnrollmentId);

    if (!!tenant) {
      if (tenant.tenantType === TenantType.SubTenant) {
        this.planForm.controls.tenantId?.setValue(tenant.tenantId);

        this.planForm.controls.subtenantId?.reset();
        this.subTenants.length = 0;

        this.subTenants.push(new Option(tenant.tenantEnrollmentId, tenant.subtenantName));

        setTimeout(() => {
          this.planForm.controls.subtenantId?.setValue(tenant.subtenantId);
        }, 100);

      } else {
        this.planForm.controls.tenantId?.setValue(tenant.tenantId);
      }
    }
  }

  private setTenants() {
    return this.payWithPointService.getTenants()
      .pipe(
        map((response => {

          if (Utils.isNotNull(response.data)) {
            this.tenantList = response.data!;

            this.tenants.push(
              ...Utils.sortArray(this.tenantList.filter(ten => ten.tenantType === TenantType.Tenant)
                .map(ten => new Option(ten.tenantEnrollmentId, ten.tenantName)), LABEL)
            );

            this.mapSubTenant();
          }
        })));
  }

  private setEnrollmentCollections(tenantEnrollmentId: string) {
    return this.enrollmentCollectionService.getEnrollmentCollectionListByTenant(
      {
        tenantId: tenantEnrollmentId
      }
    ).pipe(
      map((response => {
        if (Utils.isNotNull(response?.responseData?.enrollmentCollections)) {
          this.enrolmentCollections = response?.responseData?.enrollmentCollections.map(col => new Option(col.enrollmentCollectionId, col.enrollmentCollectionName!));
        }
      }))
    );
  }

  private setEndpointTemplates(tenantEnrollmentId: string) {
    return this.payWithPointService.getEndpointTemplates(tenantEnrollmentId)
      .pipe(
        map((response => {
          if (Utils.isNotNull(response.data)) {
            this.endpointTemplates.push(...response.data.map(temp => new Option(temp.endpointId, temp.endpointName)));
          }
        })));
  }


  private setNotificationTemplates(tenantEnrollmentId: string) {
    return this.payWithPointService.getNotificationTemplates(tenantEnrollmentId)
      .pipe(
        map((response => {
          if (Utils.isNotNull(response.data)) {
            this.notificationTemplates.push(
              ...response.data
                .map(temp => new Option(temp.notificationTemplateId.toString(), temp.notificationTemplateName))
            );
          }
        })));
  }

  private setFulfillmentTemplates(tenantEnrollmentId: string) {
    return this.payWithPointService.getFulfillmentTemplates(tenantEnrollmentId)
      .pipe(
        map((response => {
          if (Utils.isNotNull(response.data)) {
            this.fulfillmentTemplates.push(
              ...response.data.map(temp => new Option(temp.templateId, temp.templateName))
            );
          }
        })));
  }

  private updateRelatedData(tenantEnrollmentId: string) {
    if (Utils.isNotNull(tenantEnrollmentId)) {
      this.clearDependentData();

      this.setEnrollmentCollections(tenantEnrollmentId).subscribe();
      this.setEndpointTemplates(tenantEnrollmentId).subscribe();
      this.setNotificationTemplates(tenantEnrollmentId).subscribe();
      this.setFulfillmentTemplates(tenantEnrollmentId).subscribe();
    }
  }

  private clearDependentData() {
    this.planForm.controls.enrollmentCollectionId.reset();
    this.planForm.controls.endpointDefinitionId.reset();
    this.planForm.controls.notificationTemplateId.reset();
    this.planForm.controls.fulfillmentTemplateId.reset();

    this.enrolmentCollections.length = 0;
    this.notificationTemplates.length = 0;
    this.endpointTemplates.length = 0;
    this.fulfillmentTemplates.length = 0;
  }

  private registerOnChangeListeners() {
    this.formControlSubscriptions.length = 0;

    setTimeout(() => {
      const tenantEnrollmentSubs = this.planForm.controls.tenantEnrollmentId
        .valueChanges
        .pipe(takeUntil(this.destroy$), distinctUntilChanged())
        .subscribe(
          tenantEnrollmentId => {
            this.updateRelatedData(tenantEnrollmentId);
          }
        );

      const tenantSub = this.planForm.controls.tenantId?.valueChanges
        .pipe(
          takeUntil(this.destroy$),
          distinctUntilChanged()
        ).subscribe(response => {
          this.planForm.controls.subtenantId?.reset();

          this.subTenants = [];

          setTimeout(() => {
            this.subTenants = this.tenantList.filter(ten => (ten.tenantId === response) && ten.tenantType === TenantType.SubTenant)
              .map(ten => new Option(ten.subtenantId, ten.subtenantName));

          }, 100);


          this.planForm.controls.tenantEnrollmentId.setValue(response);
        });

      const subTenantSub = this.planForm.controls.subtenantId?.valueChanges
        .pipe(
          takeUntil(this.destroy$),
          distinctUntilChanged()
        ).subscribe(response => {
          if (!!response) {
            this.planForm.controls.tenantEnrollmentId.setValue(response);
          }
        });

      this.formControlSubscriptions.push(tenantEnrollmentSubs, tenantSub!, subTenantSub!);
    }, 150);

  }

  private mapMccCodes() {
    if (Utils.isNotNull(this.plan.redemptionRestrictions) && Utils.isNotNull(this.plan.redemptionRestrictions[0].values)) {
      this.mccDataSource = this.merchantCategoryCodes.filter(mcc => this.plan.redemptionRestrictions[0].values.includes(mcc.mrchCatgCd.toString()));
    }
  }

  private getAndMapTenantRelatedData() {
    const tenantEnrollmentId = this.plan.tenantEnrollmentId!;

    if (!!tenantEnrollmentId) {
      this.setEnrollmentCollections(tenantEnrollmentId).subscribe(res => {
        setTimeout(() => {
          this.planForm.controls.enrollmentCollectionId.patchValue(this.plan.enrollmentCollectionId);

        }, 100);

      });

      this.setEndpointTemplates(tenantEnrollmentId).subscribe(res => {
        setTimeout(() => {
          this.planForm.controls.endpointDefinitionId.patchValue(this.plan.endpointDefinitionId);

        }, 100);
      });

      this.setNotificationTemplates(tenantEnrollmentId).subscribe(res => {
        setTimeout(() => {
          this.planForm.controls.notificationTemplateId.patchValue(this.plan.notificationTemplateId);

        }, 100);
      });

      this.setFulfillmentTemplates(tenantEnrollmentId).subscribe(res => {
        setTimeout(() => {
          this.planForm.controls.fulfillmentTemplateId.patchValue(this.plan.fulfillmentTemplateId);

        }, 100);
      });
    }

  }

  private init() {
    this.mapMccCodes();

    this.isDataLoaded = true;

    setTimeout(
      () => {
        this.functionService.expandAccordionItems(true, this.accordions);
        this.formService.clearFormControlValidators(this.planForm);

        this.registerOnChangeListeners();

        if (this.mode === Mode.Manage) {
          this.getAndMapTenantRelatedData();
        }
      },);
  }

  private getFormValidationMap(): Map<AbstractControl, ValidatorFn | Array<ValidatorFn> | null> {
    const formValidationMap = new Map<AbstractControl, ValidatorFn | Array<ValidatorFn> | null>();

    // Basics
    formValidationMap.set(
      this.planForm.controls.planName,
      [Validators.required, CustomValidator.noWhiteSpace]
    );
    formValidationMap.set(this.planForm.controls.pointTemplateId, [Validators.required]);
    formValidationMap.set(this.planForm.controls.startDate, [Validators.required]);
    formValidationMap.set(this.planForm.controls.startTime!, [Validators.required]);
    formValidationMap.set(this.planForm.controls.endDate, [Validators.required]);
    formValidationMap.set(this.planForm.controls.endTime!, [Validators.required]);

    // Enrollment Collection
    formValidationMap.set(this.planForm.controls.enrollmentCollectionId, [Validators.required]);
    formValidationMap.set(this.planForm.controls.eligibleCardType, [Validators.required]);

    // Reward Names
    formValidationMap.set(this.planForm.controls.singularShortName, [Validators.required]);
    formValidationMap.set(this.planForm.controls.pluralShortName, [Validators.required]);

    // Eligible Currency
    formValidationMap.set(this.planForm.controls.issuerCurrency, [Validators.required]);
    formValidationMap.set(this.planForm.controls.conversionRate, [Validators.required]);


    // Fulfillment Details
    formValidationMap.set(
      this.planForm.controls.fulfillmentTemplateId,
      (this.plan.statementCreditSource === StatementCreditSource.Visa)
        ? [Validators.required]
        : null
    );
    formValidationMap.set(this.planForm.controls.statementCreditSource, [Validators.required]);

    // Terms and Conditions
    formValidationMap.set(this.termsAndConditionForm.controls.content, [Validators.required]);


    return formValidationMap;
  }

  private sortMerchantCodes(mccList: MerchantCategoryCode[]): MerchantCategoryCode[] {
    return Utils.sortArray(mccList || [], 'mrchCatgNm');
  }

  private deleteMerchantCodes(selections: MerchantCategoryCode[]) {
    const dialogConfig: DialogConfig<any> = new DialogConfig(
      `Remove Merchant Code${(selections?.length > 1) ? 's' : EMPTY}`,
      CONFIRM_MESSAGE,
      ButtonDirection.RIGHT,
      [
        {
          label: 'Remove',
          color: ButtonColor.PRIMARY,
          click: (dialogComponent: DialogComponent) => {
            if (Utils.isNotNull(selections)) {
              const codes: string[] = selections.map(mcc => mcc.mrchCatgCd.toString());

              this.mccDataSource = this.sortMerchantCodes(this.mccDataSource.filter(mcc => !codes.includes(mcc.mrchCatgCd.toString())));

              this.redemptionRestrictionFormGroup.controls.values.patchValue(this.mccDataSource.map(mcc => mcc.mrchCatgCd.toString()));

              dialogComponent.close();
            }
          }
        },
        {
          label: 'Cancel',
          color: ButtonColor.SECONDARY,
          click: (dialogComponent: DialogComponent) => dialogComponent.close()
        }
      ],
      undefined,
      undefined,
      DialogType.CONFIRMATION
    );

    this.dialog.open(
      DialogComponent,
      {
        disableClose: true,
        hasBackdrop: true,
        data: dialogConfig
      }
    );
  }

  private openMerchantCodeModal() {
    this.dialog.open(
      AddMerchantCodeDialogComponent,
      {
        hasBackdrop: true,
        disableClose: true,
        ariaLabel: 'add-merchant-code-dialog',
        data: {
          mccList: this.merchantCategoryCodes,
          selectedMccsCodes: this.redemptionRestrictionFormGroup?.value?.values || []
        }
      }
    ).afterClosed().pipe(takeUntil(this.destroy$)).subscribe((response: RedemptionRestriction) => {
      if (Utils.isNotNull(response)) {
        const mccCodes: string[] = this.redemptionRestrictionFormGroup.value.values || [];

        mccCodes.push(...response?.values);

        this.redemptionRestrictionFormGroup.controls.values.patchValue(mccCodes);

        this.mccDataSource = this.sortMerchantCodes(this.merchantCategoryCodes.filter(mcc => mccCodes.includes(mcc.mrchCatgCd.toString())));
      }
    });
  }

  protected createEnrollmentCollection() {
    this.dialog.open(
      CreateEnrollmentCollectionDialogComponent,
      {
        hasBackdrop: true,
        disableClose: true,
        ariaLabel: 'create-enrollment-collection-dialog',
        width: '1000px'
      }
    ).afterClosed().pipe(takeUntil(this.destroy$)).subscribe((response: EnrollmentCollection) => {
      if (Utils.isNotNull(response)) {
        this.formControlSubscriptions.forEach(sub => sub.unsubscribe());

        this.planForm.controls.tenantEnrollmentId.setValue(response.entityId);

        this.mapSubTenant();
        this.clearDependentData();

        this.planForm.controls.enrollmentCollectionId.setValue(response.enrollmentCollectionId);

        this.getAndMapTenantRelatedData();

        this.registerOnChangeListeners();
      }
    });
  }

  ngAfterViewInit(): void {
    this.formService.clearFormControlValidators(this.planForm);
  }


  ngOnInit(): void {
    this.termsAndConditionForm = this.planForm.controls.termsAndConditions as CustomFormGroup<TermsAndConditions>;


    forkJoin([
      this.setTenants(),
      this.setCurrencies(),
      this.setMerchantCategoryCodes(),
    ]).subscribe(
      {
        next: (response) => this.init(),
        error: (err: any) => this.init()
      }
    );
  }

  validate(): boolean {
    return this.formService.validate(this.getFormValidationMap());
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
