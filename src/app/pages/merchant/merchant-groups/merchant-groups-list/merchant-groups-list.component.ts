import { Component, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import {
  BadgeType,
  ButtonColor,
  ButtonIconType,
  TooltipPosition
} from '@visa/vds-angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EMPTY } from 'src/app/core/constants';
import { GarbageCollectorService } from 'src/app/services/garbage-collector.service';
import { HttpService } from 'src/app/services/http/http.service';
import { NavStatusService } from 'src/app/services/nav-status/nav-status.service';
import { CreateDataService } from 'src/app/services/private/create-data.service';
import {
  TableDataCountService,
  merchant
} from 'src/app/services/private/table-data-count.service';
import { tableHeader } from '../../merchant.constants';
import { CreateDialogComponent } from '../merchant-group-create/create-dialog/create-dialog.component';

@Component({
  selector: 'app-merchant-groups-list',
  templateUrl: './merchant-groups-list.component.html',
  styleUrls: ['./merchant-groups-list.component.scss']
})
export class MerchantGroupsListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  BadgeType = BadgeType;
  ButtonIconType = ButtonIconType;
  ButtonColor = ButtonColor;
  TooltipPosition = TooltipPosition;

  searchActivate: boolean = false;
  loading: boolean = false;
  isPanelOpen: boolean = false;

  merchatData: any[] = [];
  selectedIndex: number[] = [];

  searchData: UntypedFormGroup;

  communityCode = this.route.snapshot.queryParams['client'];
  page = 0;
  size = 50;
  totalElements = 0;
  sortColumnName: 'name' | 'merchantGroupType' | 'isActive' | 'modifiedDate' =
    'name';
  sortColumnType: 'asc' | 'desc' = 'asc';

  constructor(
    private http: HttpService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: UntypedFormBuilder,
    private viewContainerRef: ViewContainerRef,
    private dataService: CreateDataService,
    private dataPool: TableDataCountService,
    private dialog: MatDialog,
    private status: NavStatusService
  ) {
    this.searchData = this.fb.group({
      name: [EMPTY],
      MerchantGroupType: [EMPTY],
      isActive: [EMPTY]
    });

    this.status.getPanelStatus
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: panelStatus => {
          this.isPanelOpen = panelStatus;
          if (!this.isPanelOpen && !this.searchActivate) {
            if (
              prevSearchValue.name ||
              prevSearchValue.value ||
              prevSearchValue.type
            ) {
              this.getMerchantGroups();
            }
            this.clearSearch();
          }
        }
      });

    this.searchData.valueChanges
      .pipe(takeUntil(this.destroy$)).subscribe(res => {
        if (JSON.stringify(res) != JSON.stringify(prevSearchValue)) {
          prevSearchValue = res;
          if (this.searchActivate) {
            this.search();
          }
        }
      });

    let prevSearchValue = { name: EMPTY, value: EMPTY, type: EMPTY };
  }

  columns = tableHeader;
  sortBy: string[] = Array(this.columns.length)
    .fill('-ascending', 0, 1)
    .fill('', 1);

  ngOnInit(): void {
    this.getMerchantGroups();
    this.dataService.createMerchantData.next(null);
    this.dataPool.setSelectedMerchant(null);
  }

  search() {
    this.searchActivate = true;
    this.status.togglePanel(false);

    this.getMerchantGroups();
  }
  clearSearch() {
    this.searchActivate = false;
    Object.keys(this.searchData.getRawValue()).map(key => {
      this.searchData.get(key)?.setValue('');
    });
  }

  openSearch() {
    this.status.togglePanel(true);
    this.searchActivate = false;
  }

  createMerchantGroup() {
    this.dialog.open(
      CreateDialogComponent,
      {
        width: '720px',
        ariaLabel: 'confirm-delete-dialog',
        hasBackdrop: true, disableClose: true,
      }
    ).afterClosed()
      .pipe(takeUntil(this.destroy$)).subscribe(result => {
        this.dataService.createMerchantData.next(result);

        this.router.navigate(
          [`/merchant/view/${result.merchantGroupName}/basics`],
          {
            queryParams: { type: result.type },
            queryParamsHandling: 'merge'
          }
        );
      });
  }

  getMerchantGroups() {
    this.loading = true;
    this.merchatData = [];
    // this.tableData = [];
    const formvalues = this.searchData.getRawValue();

    let parmsObj = {
      communityCode: this.communityCode,
      page: this.page,
      size: this.size,
      sort: `${this.sortColumnName},${this.sortColumnType}`,
      ...(this.searchActivate && {
        ...(formvalues.name && { name: formvalues.name }),
        ...(formvalues.MerchantGroupType && {
          merchantGroupType: formvalues.MerchantGroupType
        }),
        ...(formvalues.isActive && {
          isActive: formvalues.isActive
        })
      })
    };

    this.http.get(`api/merchantgroup/listMerchantGroups`, parmsObj)
    .pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.loading = false;
        res = JSON.parse(res.body);
        // const sample = sampleResponse;

        this.totalElements = res.page.totalElements;
        this.merchatData = res.data;
        // this.tableData = [...this.MerchatData];
      },
      error: err => {
        this.loading = false;
        console.log(err);
      }
    });
  }

  goToMerchant(merchant: merchant) {
    // this.dataService.createMerchantData.next(merchant);
    this.dataPool.setSelectedMerchant(merchant);
  }

  handleSort(col: any, indx: number) {
    if (this.sortBy[indx] !== '-descending') {
      this.sortBy = this.sortBy.map((res, i) =>
        indx === i ? '-descending' : ''
      );
    } else {
      this.sortBy = this.sortBy.map((res, i) =>
        indx === i ? '-ascending' : ''
      );
    }
    this.sortColumnName = col;
    this.sortColumnType = this.sortBy[indx] == '-descending' ? 'desc' : 'asc';
    this.getMerchantGroups();
  }

  handlePagination(e: any) {
    this.page = e.pageIndex;
    this.size = e.pageSize; //not necessary

    this.getMerchantGroups();
  }

  ngOnDestroy(): void {
    this.status.togglePanel(false);

    this.destroy$.next();
    this.destroy$.complete();

    GarbageCollectorService.clearDetachedDOMElements(
      this,
      this.viewContainerRef
    );
  }
}
