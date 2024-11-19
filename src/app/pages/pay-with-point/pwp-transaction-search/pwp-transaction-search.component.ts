import { AfterViewInit, Component, OnDestroy, OnInit, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BadgeType } from '@visa/vds-angular';
import { distinctUntilChanged, map, merge, Observable, of, Subject, takeUntil } from 'rxjs';
import { COMMA, REQUIRED_FIELD, SUCCESS_CODE } from 'src/app/core/constants';
import { DialogConfig } from 'src/app/core/dialog/dialog.model';
import { Option } from 'src/app/core/models/option.model';
import { PaginationResponse } from 'src/app/core/models/pagination-response.model';
import { DialogService } from 'src/app/services/dialog/dialog.service';
import { EnrollmentCollectionService } from 'src/app/services/enrollment-collection/enrollment-collection.service';
import { FormBuilder, FormService } from 'src/app/services/form-service/form.service';
import { GarbageCollectorService } from 'src/app/services/garbage-collector.service';
import { NavStatusService } from 'src/app/services/nav-status/nav-status.service';
import { PwpCsrService } from 'src/app/services/pay-with-point/pwp-csr.service';
import { ToggleAlertService } from 'src/app/services/toggle-alert/toggle-alert.service';
import { Utils } from 'src/app/services/utils';
import { SearchTableComponent } from 'src/app/shared/search-table/search-table.component';
import { SearchField, SearchFieldType, SearchTableColumn, SearchTableColumnType, SortType } from 'src/app/shared/search-table/search-table.model';
import { Tenant, TenantType } from '../../enrollment-collection/enrollment-collection.model';
import { PWP_TRANSACTION_SEARCH_TYPE, PwPCSRTxResult } from '../pwp-pan-elibility.model';
import { MAX_TRANSACTION_IDS_LIMIT, MULTIPLE_TRANSACTION_IDS_PATTERN, PAN_PATTERN } from '../pwpConstants';
import { PwpTransactionDetailsDialogComponent } from './pwp-transaction-details-dialog/pwp-transaction-details-dialog.component';

@Component({
  selector: 'app-pwp-transaction-search',
  templateUrl: './pwp-transaction-search.component.html',
  styleUrls: ['./pwp-transaction-search.component.scss']
})
export class PwpTransactionSearchComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild('existColRef')
  existColRef!: TemplateRef<any>;

  @ViewChild('searchByFilters')
  searchByFiltersRef!: TemplateRef<any>;

  @ViewChild(SearchTableComponent)
  tableComponent!: SearchTableComponent;

  private destroy$ = new Subject<void>();

  SortType = SortType;

  showSearchTable: boolean = false;
  initSearch: boolean = false;
  availablePan!: string;
  availableTenantId!: string;
  availableSubTenantId!: string;

  transactionSearchTypeEnum = PWP_TRANSACTION_SEARCH_TYPE;
  badgeTypeEnum = BadgeType;

  panSearchControl = this.formBuilder.control(null);
  transactionIdsSearchControl = this.formBuilder.control(
    null
  );

  tenantList!: Tenant[];

  advancedSearchFields: ReadonlyArray<SearchField> = [];
  tableColumns: ReadonlyArray<SearchTableColumn> = [];

  searchByOptions: Option[] = [
    {
      label: 'PAN',
      value: PWP_TRANSACTION_SEARCH_TYPE.PAN
    },
    {
      label: 'Transaction ID',
      value: PWP_TRANSACTION_SEARCH_TYPE.TRANSACTION_ID
    }
  ];

  get searchBy(): PWP_TRANSACTION_SEARCH_TYPE {
    return this.tableComponent?.advancedSearchForm?.value['searchBy'];
  }


  constructor(
    private navStatusService: NavStatusService,
    private alertService: ToggleAlertService,
    private viewContainerRef: ViewContainerRef,
    private enrollmentCollectionService: EnrollmentCollectionService,
    private pwpScrService: PwpCsrService,
    private formBuilder: FormBuilder,
    private dialogService: DialogService,
    private activatedRoute: ActivatedRoute,
    private formService: FormService
  ) {
    this.navStatusService.setOverlayStatus(false);
  }

  private initTableConfig(): void {
    this.setSearchFields();

    this.showSearchTable = true;

    setTimeout(() => {
      this.tableComponent.advancedSearchForm.controls['searchBy'].patchValue(this.transactionSearchTypeEnum.PAN);

      if (this.availablePan) {
        const tenant = this.tenantList.find(tn => this.availableTenantId && (tn.tenantId === this.availableTenantId));
        const subTenant = this.tenantList.find(tn => this.availableSubTenantId && (tn.subtenantId === this.availableSubTenantId));
        if (tenant) {
          this.tableComponent.advancedSearchForm.get('tenantId')?.patchValue({
            label: tenant.tenantName,
            value: tenant.tenantId
          });
        }

        if (subTenant) {
          this.tableComponent.advancedSearchForm.get('subTenantId')?.patchValue({
            label: subTenant.subtenantName,
            value: subTenant.subtenantId
          });
        }
        this.panSearchControl.patchValue(this.availablePan);

        this.tableComponent.searchActivate = true;

        this.tableComponent.performSearch(0);
      }
    }, 100);
  }


  private transactionIdValidator(control: AbstractControl): ValidationErrors | null {
    const transactionIds: string[] = String(control.value || '').split(COMMA);

    if (transactionIds.length > MAX_TRANSACTION_IDS_LIMIT) {
      return { maxTransactionIds: true };
    }

    return null;
  }

  private getTenantList(): void {
    this.enrollmentCollectionService.getTenantList().subscribe({
      next: (response: PaginationResponse<Array<Tenant>>) => {

        if ((response.statusCode === SUCCESS_CODE) && Utils.isNull(response.errors)) {
          this.tenantList = response.data;

          this.initTableConfig();
        } else {
          this.alertService.showResponseErrors(response.errors);
        }
      },
      error: error => {
        this.alertService.showError(error);
        console.log(error);
      }
    });
  }


  private searchByValidator(control: AbstractControl): ValidationErrors | null {
    const value: PWP_TRANSACTION_SEARCH_TYPE = control.value;

    if (((value === PWP_TRANSACTION_SEARCH_TYPE.PAN) && (!this.panSearchControl.value || this.panSearchControl.invalid))
      ||
      ((value === PWP_TRANSACTION_SEARCH_TYPE.TRANSACTION_ID) && (!this.transactionIdsSearchControl.value || this.transactionIdsSearchControl.invalid))
    ) {
      return { invalid: true };
    }

    return null;
  }

  private setSearchFields(): void {
    this.advancedSearchFields = [
      {
        key: 'tenantId',
        label: 'Tenant',
        type: SearchFieldType.SEARCH_SELECT,
        // showOnReset: true,
        validators: [Validators.required],
        options: this.enrollmentCollectionService.getEntityOptionList(
          this.tenantList,
          TenantType.TENANT
        )
      },
      {
        key: 'subTenantId',
        label: 'Sub-Tenant',
        type: SearchFieldType.SEARCH_SELECT,
        // showOnReset: true,
        searchDependencies: [
          {
            parentField: 'tenantId',
            isMandatory: true
          }
        ],
        searchOptions: (tenantId: string, params) => {
          const subTenants = this.enrollmentCollectionService.getEntityOptionList(
            this.tenantList,
            TenantType.SUBTENANT,
          ).filter(ten => ten?.rawValue?.tenantId === tenantId);

          return of(subTenants);
        }
      },
      // {
      //   key: 'period',
      //   label: 'Lookback Period (in months)',
      //   type: SearchFieldType.NUMBER,
      //   validators: [Validators.min(1), Validators.max(36)],
      //   validationError: {
      //     min: INVALID_LOOKBACK_PERIOD,
      //     max: INVALID_LOOKBACK_PERIOD,
      //   }
      // },
      {
        key: 'searchBy',
        label: 'Search By',
        type: SearchFieldType.CUSTOM,
        templateRef: this.searchByFiltersRef,
        disableReset: true,
        fullWidth: true,
        disableOnChange: true,
        validators: [this.searchByValidator.bind(this)]
      }
    ];
  }

  private setTableColumns(): void {
    this.tableColumns = [
      {
        key: 'pwpTransactionId',
        label: 'PwP Transaction ID',
        type: SearchTableColumnType.LINK,
        fixed: true,
        click: (row, table) => {
          const dialogConfig: DialogConfig<PwPCSRTxResult> = {
            data: row
          };

          this.dialogService.openDialog(
            PwpTransactionDetailsDialogComponent,
            {
              width: '70vw',
              data: dialogConfig
            }
          );
        },
      },
      {
        key: 'isExist',
        label: 'Exists?',
        type: SearchTableColumnType.TEMPLATE,
        columnTemplateRef: this.existColRef
      },
      {
        key: 'transactionAmount',
        label: 'Transaction Amount'
      },
      {
        key: 'transactionCurrencyCode',
        label: 'Transaction Currency Code'
      },
      {
        key: 'transactionTimestamp',
        label: 'Transaction Timestamp',
        type: SearchTableColumnType.DATE
      },
      {
        key: 'last',
        label: 'Last 4',
        mapValue: (row: PwPCSRTxResult, table: SearchTableComponent) => {
          return row?.pointsRedeem?.[0]?.last4;
        }
      },
      {
        key: 'stCrAmt',
        label: 'Statement Credit Amount'
      },
      {
        key: 'merchantName',
        label: 'Merchant Name'
      },
      {
        key: 'pointRedm',
        label: 'Points Redeemed',
        mapValue: (row: PwPCSRTxResult, table: SearchTableComponent) => {
          return row?.pointsRedeem?.[0]?.pointsRedeemed;
        }
      },
      {
        key: 'ineliResn',
        label: 'Ineligibility Reason',
        mapValue: (row: PwPCSRTxResult, table: SearchTableComponent) => {
          return row?.pointsEnquiry?.ineligibleReason;
        }
      },
      {
        key: 'inelSt',
        label: 'Eligibility Status'
      },
      {
        key: 'merchantCategoryCode',
        label: 'MCC'
      },
      {
        key: 'planId',
        label: 'Plan ID'
      },
      {
        key: 'conRt',
        label: 'Conversion Rate',
        mapValue: (row: PwPCSRTxResult, table: SearchTableComponent) => {
          return row?.pointsEnquiry?.conversionRate;
        }
      },
      {
        key: 'fulAmt',
        label: 'Fulfillment Amount'
      }
    ];
  }
  private init(): void {
    this.getTenantList();
  }

  private validateCustomFilters(): boolean {
    const formValidationMap = new Map<AbstractControl, ValidatorFn | Array<ValidatorFn> | null>();

    formValidationMap.set(this.panSearchControl, [(this.searchBy === PWP_TRANSACTION_SEARCH_TYPE.PAN) ? Validators.required : Validators.nullValidator, Validators.pattern(PAN_PATTERN)]);

    formValidationMap.set(this.transactionIdsSearchControl, [
      (this.searchBy === PWP_TRANSACTION_SEARCH_TYPE.TRANSACTION_ID) ? Validators.required : Validators.nullValidator,
      Validators.pattern(MULTIPLE_TRANSACTION_IDS_PATTERN),
      this.transactionIdValidator
    ]);

    return this.formService.validate(formValidationMap);

  }

  protected handlePerformSearch(): void {
    this.validateCustomFilters();
  }

  protected handleSearchTypeChange(): void {
    this.panSearchControl.setErrors(null);
    this.transactionIdsSearchControl.setErrors(null);
    this.panSearchControl.reset(null);
    this.transactionIdsSearchControl.reset(null);
  }

  protected disabledSearch(): boolean {
    return (
      ((this.searchBy === PWP_TRANSACTION_SEARCH_TYPE.PAN) && this.panSearchControl.invalid)
      ||
      ((this.searchBy === PWP_TRANSACTION_SEARCH_TYPE.TRANSACTION_ID) && this.transactionIdsSearchControl.invalid)
    );

  }

  ngAfterViewInit(): void {
    this.setTableColumns();

    merge(
      this.panSearchControl.valueChanges,
      this.transactionIdsSearchControl.valueChanges
    ).pipe(takeUntil(this.destroy$), distinctUntilChanged())
      .subscribe(response => {
        if (this.tableComponent.searchActivate && response) {
          this.tableComponent.performSearch(0);
        }

        this.tableComponent.advancedSearchForm.get('searchBy')?.setErrors(null);
      });
  }


  ngOnInit(): void {

    this.init();
    this.availablePan = this.activatedRoute.snapshot.paramMap.get('pan')!;
    this.availableTenantId = this.activatedRoute.snapshot.paramMap.get('tenId')!;
    this.availableSubTenantId = this.activatedRoute.snapshot.paramMap.get('subTenId')!;
  }

  getError(control: AbstractControl): string {
    if (control?.invalid && control?.errors) {
      if (control.errors?.['required']) {
        return REQUIRED_FIELD;
      }

      if (this.searchBy === PWP_TRANSACTION_SEARCH_TYPE.PAN) {
        return 'Invalid Pan. PAN should have a length of 16-19 digit.';
      }

      if (this.searchBy === PWP_TRANSACTION_SEARCH_TYPE.TRANSACTION_ID) {
        if (control.errors['maxTransactionIds']) {
          return `Maximum ${MAX_TRANSACTION_IDS_LIMIT} transaction Ids are allowed.`;
        }
        return 'Invalid Transactions Ids';
      }
    }

    return '';
  }

  getTransactions(filters: any = {}): Observable<PaginationResponse<PwPCSRTxResult[]>> {
    const valid = this.validateCustomFilters();

    if (!valid) {
      return of(new PaginationResponse([]));
    } else {
      const params = {
        ...filters,
        pan: this.panSearchControl.value,
        trxtIds: this.transactionIdsSearchControl.value
      };


      return this.pwpScrService.getTransactions(params).pipe(map(response => {
        for (const item of response.data) {
          item.isExist = !!item.merchantCategoryCode && !!item.merchantName;
        }

        return response;
      }));
    }
  }

  handleSearchFilterReset(): void {
    this.panSearchControl.reset();
    this.transactionIdsSearchControl.reset();
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    GarbageCollectorService.clearDetachedDOMElements(
      this,
      this.viewContainerRef
    );
  }

}
