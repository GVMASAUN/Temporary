import { AfterViewInit, Component, OnDestroy, OnInit, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { map, Observable, of } from 'rxjs';
import { EMPTY, SUCCESS_CODE } from 'src/app/core/constants';
import { PaginationResponse } from 'src/app/core/models/pagination-response.model';
import { EnrollmentCollectionService } from 'src/app/services/enrollment-collection/enrollment-collection.service';
import { GarbageCollectorService } from 'src/app/services/garbage-collector.service';
import { NavStatusService } from 'src/app/services/nav-status/nav-status.service';
import { PwpCsrService } from 'src/app/services/pay-with-point/pwp-csr.service';
import { ToggleAlertService } from 'src/app/services/toggle-alert/toggle-alert.service';
import { Utils } from 'src/app/services/utils';
import { SearchTableComponent } from 'src/app/shared/search-table/search-table.component';
import { SearchField, SearchFieldType, SearchTableColumn, SearchTableColumnType } from 'src/app/shared/search-table/search-table.model';
import { Tenant, TenantType } from '../../enrollment-collection/enrollment-collection.model';
import { PAN_ELIGIBILITY_STATUS_BADGE_TYPE, PAN_ELIGIBILITY_STATUS_DESC, PanEligibilityStatus, PwpPanCardEligibility } from '../pwp-pan-elibility.model';
import { MULTIPLE_PANS_PATTERN, PWP_TRANSACTION_SEARCH_URL } from '../pwpConstants';

@Component({
  selector: 'app-pwp-pan-eligibility',
  templateUrl: './pwp-pan-eligibility.component.html',
  styleUrls: ['./pwp-pan-eligibility.component.scss']
})
export class PwpPanEligibilityComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('eligibilityColRef')
  eligibilityColRef!: TemplateRef<any>;


  PAN_ELIGIBILITY_STATUS_DESC = PAN_ELIGIBILITY_STATUS_DESC;
  PAN_ELIGIBILITY_STATUS_BADGE_TYPE = PAN_ELIGIBILITY_STATUS_BADGE_TYPE;
  elenum = PanEligibilityStatus;

  showSearchTable: boolean = false;

  tenantList!: Tenant[];

  advancedSearchFields: ReadonlyArray<SearchField> = [];
  tableColumns: ReadonlyArray<SearchTableColumn> = [];

  constructor(
    private navStatusService: NavStatusService,
    private alertService: ToggleAlertService,
    private viewContainerRef: ViewContainerRef,
    private enrollmentCollectionService: EnrollmentCollectionService,
    private pwpCsrService: PwpCsrService,
    private router: Router
  ) {
    this.navStatusService.setOverlayStatus(false);
  }


  private getTenantList(): void {
    this.enrollmentCollectionService.getTenantList().subscribe({
      next: (response: PaginationResponse<Array<Tenant>>) => {

        if ((response.statusCode === SUCCESS_CODE) && Utils.isNull(response.errors)) {
          this.tenantList = response.data;

          this.setSearchFields();

          this.showSearchTable = true;
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

  private navigateToTransactionDetails(panEligibility: PwpPanCardEligibility, searchTable: SearchTableComponent): void {
    if (panEligibility.status === PanEligibilityStatus.Eligible) {
      const filters: any = searchTable.getSearchParameter(0);
      const pans: string[] = this.pwpCsrService.getPanList(filters);
      const tenantId = filters?.tenantId;
      const subTenantId = filters?.subTenantId;

      this.navStatusService.setSubTabIndex(2);
      this.router.navigate(
        [
          PWP_TRANSACTION_SEARCH_URL,
          pans?.[panEligibility.panIndex || 0],
          tenantId,
          subTenantId || EMPTY
        ],
        {
          queryParamsHandling: 'merge'
        }
      );
    }
  }


  private setSearchFields(): void {
    this.advancedSearchFields = [
      {
        key: 'tenantId',
        label: 'Tenant',
        type: SearchFieldType.SEARCH_SELECT,
        showOnReset: true,
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
        showOnReset: true,
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
        },
      },
      {
        key: 'pans',
        label: 'List of PAN(s)',
        type: SearchFieldType.TEXT_AREA,
        fullWidth: true,
        validators: [Validators.required, Validators.pattern(MULTIPLE_PANS_PATTERN)],
        validationError: {
          pattern: 'PAN should have a length of 16-19 digits and multiple PANs must be separated by comma only.'
        }
      },
      // {
      //   key: 'date',
      //   label: 'Eligibility Date(MM/DD/YYYY)',
      //   type: SearchFieldType.DATE,
      //   validators: [Validators.nullValidator],
      //   validationError: {
      //     invalid: 'Invalid date format.'
      //   }
      // }
    ];
  }

  private setTableColumns(): void {
    this.tableColumns = [
      {
        key: 'maskedPan',
        label: 'PAN',
        type: SearchTableColumnType.LINK,
        fixed: true,
        click: (panEligibility: PwpPanCardEligibility, searchTable: SearchTableComponent) => this.navigateToTransactionDetails(panEligibility, searchTable)
      },
      {
        key: 'status',
        label: 'Eligibility Status',
        type: SearchTableColumnType.TEMPLATE,
        columnTemplateRef: this.eligibilityColRef
      }
    ];
  }

  protected getEligibilityStatus(row: PwpPanCardEligibility): PanEligibilityStatus {
    return row.status;
  }

  ngAfterViewInit(): void {
    this.setTableColumns();

  }

  ngOnInit(): void {
    this.getTenantList();
  }

  getPans(filters: any = {}): Observable<PaginationResponse<PwpPanCardEligibility[]>> {
    return this.pwpCsrService.getPans(filters)
      .pipe(map(response => {
        const pans: string[] = this.pwpCsrService.getPanList(filters);
        const cardStatusList = response.data.cardStatusList;

        for (const item of cardStatusList) {
          const pan = pans[item.panIndex] || EMPTY;

          item.pan = pan;
          item.maskedPan = pan.substring(0, pan.length - 4).replace(new RegExp("[0-9]", "g"), "X").concat(pan.substring(pan.length - 4));
        }

        return new PaginationResponse(cardStatusList);
      })
      );
  }

  ngOnDestroy(): void {
    GarbageCollectorService.clearDetachedDOMElements(
      this,
      this.viewContainerRef
    );
  }

}
