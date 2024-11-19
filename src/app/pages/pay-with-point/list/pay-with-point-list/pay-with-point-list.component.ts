import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonColor } from '@visa/vds-angular';
import { isEmpty } from 'lodash';
import { Observable, Subject, takeUntil } from 'rxjs';
import { Module } from 'src/app/core/models/module.model';
import { Option } from 'src/app/core/models/option.model';
import { PaginationResponse } from 'src/app/core/models/pagination-response.model';
import { STATUS_CODE_BY_STATUS, StatusCode, StatusDesc } from 'src/app/core/models/status.model';
import { GarbageCollectorService } from 'src/app/services/garbage-collector.service';
import { NavStatusService } from 'src/app/services/nav-status/nav-status.service';
import { PayWithPointService } from 'src/app/services/pay-with-point/pay-with-point.service';
import { AppStoreService, SearchTableState } from 'src/app/services/stores/app-store.service';
import { Utils } from 'src/app/services/utils';
import { SearchTableComponent } from 'src/app/shared/search-table/search-table.component';
import { SearchField, SearchFieldType, SearchTableAction, SearchTableColumn, SearchTableColumnType } from 'src/app/shared/search-table/search-table.model';
import { Plan } from '../../pwp-csr.model';

@Component({
  selector: 'app-pay-with-point-list',
  templateUrl: './pay-with-point-list.component.html',
  styleUrls: ['./pay-with-point-list.component.scss']
})
export class PayWithPointListComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(SearchTableComponent)
  searchTableComponent!: SearchTableComponent;

  private destroy$ = new Subject<void>();

  protected readonly tableId: string = 'pay-with-point-list';
  protected readonly PAY_WITH_POINT = Module.PAY_WITH_POINT;

  protected isPanelOpen: boolean = false;

  protected tableColumns: SearchTableColumn[] = [];

  protected tableActions: SearchTableAction[] = [
    {
      label: 'CREATE PLAN',
      buttonColor: ButtonColor.SECONDARY,
      click: () => {
        this.router.navigate(
          [
            Module.PAY_WITH_POINT.baseUrl,
            'create'
          ],
          {
            queryParamsHandling: 'merge'
          }
        );
      }
    }
  ];

  protected searchFields: Array<SearchField> = [
    {
      key: 'planName',
      label: 'Plan Name'
    },
    {
      key: 'planStatus',
      label: 'Status',
      type: SearchFieldType.DROPDOWN,
      disableReset: true,
      options: [
        new Option(StatusCode[StatusCode.APPROVED], StatusDesc.APPROVED),
        new Option(StatusCode[StatusCode.DRAFT], StatusDesc.DRAFT),
        new Option(StatusCode[StatusCode.PENDING_APPROVAL], StatusDesc.PENDING_APPROVAL),
        new Option(StatusCode[StatusCode.ACTIVE], StatusDesc.ACTIVE),
        new Option(StatusCode[StatusCode.REJECTED], StatusDesc.REJECT),
        new Option(StatusCode[StatusCode.INACTIVE], StatusDesc.INACTIVE),
        new Option(StatusCode[StatusCode.ARCHIVED], StatusDesc.ARCHIVED)
      ]
    },
    // {
    //   key: 'entityType',
    //   label: 'Entity',
    //   type: SearchFieldType.DROPDOWN,
    //   options: [
    //     new Option(PlanType.Tenant, PlanTypeDesc[PlanType.Tenant]),
    //     new Option(PlanType.Sub_Tenant, PlanTypeDesc[PlanType.Sub_Tenant])
    //   ]
    // },
    // {
    //   key: 'entityId',
    //   label: 'Entity ID',
    //   type: SearchFieldType.DROPDOWN,
    // },
    {
      key: 'startDate',
      label: 'Start Date (MM/DD/YYYY)',
      type: SearchFieldType.GMT_DATE
    },
    {
      key: 'endDate',
      label: 'End Date (MM/DD/YYYY)',
      type: SearchFieldType.GMT_DATE
    }
  ];


  constructor(
    private router: Router,
    private navStatusService: NavStatusService,
    private payWithPointServiceService: PayWithPointService,
    private viewContainerRef: ViewContainerRef,
    private appStoreService: AppStoreService
  ) {
    this.setTableColumns();
  }

  private setTableColumns() {
    this.tableColumns.push(
      ...[
        {
          key: 'planName',
          label: 'Plan Name',
          type: SearchTableColumnType.LINK,
          fixed: true,
          click: (plan: Plan, component: SearchTableComponent) =>
            this.router.navigate(
              [
                Module.PAY_WITH_POINT.baseUrl,
                'manage',
                plan.planId,
                plan.tenantEnrollmentId,
                plan.version
              ],
              {
                queryParamsHandling: 'merge'
              }
            )
        },
        // {
        //   key: 'entityType',
        //   label: 'Entity',
        //   type: SearchTableColumnType.DEFAULT
        // },
        // {
        //   key: 'entityId',
        //   label: 'Entity ID'
        // },
        {
          key: "statusCode",
          label: 'Status',
          type: SearchTableColumnType.STATUS,
          showStatusIcon: true,
          mapValue: (row: Plan, table: SearchTableComponent) => STATUS_CODE_BY_STATUS[row.planStatus!],
          tooltip: (row: Plan) => row.comment!
        },
        {
          key: 'hasDraft',
          label: 'Has Draft',
          sortable: false
        },
        {
          key: "startDate",
          label: 'Start Date',
          type: SearchTableColumnType.GMT_DATE
        },
        {
          key: "endDate",
          label: 'End Date',
          type: SearchTableColumnType.GMT_DATE
        }
      ]
    );
  }

  private registerOnChangeListeners() {
    this.navStatusService.getPanelStatus.pipe(takeUntil(this.destroy$))
      .subscribe({
        next: panelStatus => {
          this.isPanelOpen = panelStatus;
        }
      });
  }

  protected advancedSearch(
    filters: any = {}
  ): Observable<PaginationResponse<Plan[]>> | null {
    const params = {
      ...filters
    };
    if (Utils.isNotNull(filters?.planStatus)) {
      return this.payWithPointServiceService.advancedSearch(params);
    }

    return null;
  }

  protected setDefaultSearchFilter(isResetRequest: boolean = false) {
    const searchTableState: SearchTableState = this.appStoreService.getSearchTableState(this.tableId);

    if (isEmpty(searchTableState) || Utils.isNull(searchTableState.searchFilters!['planStatus'])) {
      this.appStoreService.setSearchTableState(this.tableId, {
        searchFilters: {
          planStatus: StatusCode[StatusCode.ACTIVE]
        }
      });
    }

    if (isResetRequest) {
      this.searchTableComponent.advancedSearchForm.get("planStatus")?.patchValue(StatusCode[StatusCode.ACTIVE]);
    }
  }

  ngAfterViewInit(): void {
    this.registerOnChangeListeners();
  }

  ngOnInit(): void {
    this.setDefaultSearchFilter();

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
