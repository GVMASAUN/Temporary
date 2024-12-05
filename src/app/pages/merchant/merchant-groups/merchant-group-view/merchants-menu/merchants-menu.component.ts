import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import {
  AlertType,
  BadgeType,
  ButtonColor,
  ButtonIconType,
  DataTableSize,
  TooltipPosition,
} from '@visa/vds-angular';
import * as moment from 'moment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DateTimeFormat, EMPTY } from 'src/app/core/constants';
import { HttpService } from 'src/app/services/http/http.service';
import { NavStatusService } from 'src/app/services/nav-status/nav-status.service';
import { TableDataCountService } from 'src/app/services/private/table-data-count.service';
import { ToggleAlertService } from 'src/app/services/toggle-alert/toggle-alert.service';
import { DateUtils } from 'src/app/services/util/dateUtils';
import { Utils } from 'src/app/services/utils';
import { SearchTableColumnType } from 'src/app/shared/search-table/search-table.model';
import { MerchantGroupType } from '../../../merchant.model';
import { ActivateConfirmDialogComponent } from '../../merchant-group-create/activate-confirm-dialog/activate-confirm-dialog.component';
import { DeactivateConfirmDialogComponent } from '../../merchant-group-create/deactivate-confirm-dialog/deactivate-confirm-dialog.component';
import { UpdateDateModalComponent } from './update-date-modal/update-date-modal.component';

@Component({
  selector: 'app-merchants-menu',
  templateUrl: './merchants-menu.component.html',
  styleUrls: ['./merchants-menu.component.scss'],
  providers: [DatePipe],
})
export class MerchantsMenuComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  ButtonIconType = ButtonIconType;
  ButtonColor = ButtonColor;
  TooltipPosition = TooltipPosition;
  BadgeType = BadgeType;
  SearchTableColumnType = SearchTableColumnType;
  DataTableSize = DataTableSize;
  DateFormat = DateTimeFormat;

  merchantGroupName: string = EMPTY;
  groupId: string = EMPTY;
  communityCode: string = EMPTY;
  merchantGroupId: string = EMPTY;

  merchantGroupType = this.route.snapshot.queryParams['type'];

  merchantActive: boolean = false;
  searchActivate: boolean = false;
  isPanelOpen: boolean = false;
  loading: boolean = false;

  page: number = 0;
  size: number = 50;
  totalElements: number = 0;

  sortColumnName =
    this.merchantGroupType == 'MerchantInfo' ? 'visaMerchantId' : 'acquirerBin';
  sortColumnType: 'asc' | 'desc' = 'asc';

  tableData: any[] = [];
  selectedMerchants: any[] = [];
  selectedIndex: number[] = [];
  columns: any[] = [];
  sortBy: string[] = [];
  activeFilters: string[] = [];

  timeZone = DateUtils.getTimeZone();

  col1 = { label: EMPTY, value: EMPTY, fixed: false };
  col2 = { label: EMPTY, value: EMPTY, fixed: false };

  searchPanel = this.fb.group({
    acquirerBin: EMPTY,
    cardAcceptorId: EMPTY,
    externalId: EMPTY,
    startDate: EMPTY,
    startTime: EMPTY,
    endDate: EMPTY,
    endTime: EMPTY,
    isActive: EMPTY,
    visaMerchantId: EMPTY,
    visaMerchantName: EMPTY,
    visaStoreId: EMPTY,
    visaStoreName: EMPTY,
  });

  prevSearchValue = { ...this.searchPanel.getRawValue() };

  constructor(
    private route: ActivatedRoute,
    private dataPool: TableDataCountService,
    private dialog: MatDialog,
    private http: HttpService,
    private status: NavStatusService,
    private fb: UntypedFormBuilder,
    private datepipe: DatePipe,
    private navStatusService: NavStatusService,
    private alertService: ToggleAlertService
  ) {
    if (this.merchantGroupType == 'MerchantInfo') {
      this.col1.label = 'VMID';
      this.col1.value = 'visaMerchantId';
      this.col1.fixed = true;
      this.col2.label = 'VSID';
      this.col2.value = 'visaStoreId';
      this.col2.fixed = true;
    } else {
      this.col1.label = 'BIN';
      this.col1.value = 'acquirerBin';
      this.col2.label = 'CAID';
      this.col2.value = 'cardAcceptorId';
    }
    this.columns = [
      {
        label: this.col1.label,
        value: this.col1.value,
        checked: true,
        fixed: this.col1.fixed,
        sortable: true,
      },
      {
        label: this.col2.label,
        value: this.col2.value,
        fixed: this.col2.fixed,
        checked: true,
        sortable: true,
      },
      {
        label: 'Status',
        value: 'isActive',
        type: SearchTableColumnType.STATUS,
        checked: true,
        sortable: true,
      },
      {
        label: 'External ID',
        value: 'externalId',
        checked: true,
        sortable: true,
      },
      {
        label: 'Start Date',
        value: 'startDateInMerchantGroup',
        sortMapping: 'startDate',
        type: SearchTableColumnType.DATE,
        checked: true,
        sortable: true,
      },
      {
        label: 'End Date',
        sortMapping: 'endDate',
        type: SearchTableColumnType.DATE,
        value: 'endDateInMerchantGroup',
        checked: true,
        sortable: true,
      },
      {
        label: 'Last Modified Date',
        value: 'modifiedDate',
        type: SearchTableColumnType.DATE,
        checked: true,
        sortable: true,
      },
    ];

    if (this.merchantGroupType == 'MerchantInfo') {
      this.columns.splice(1, 0, {
        label: 'Visa Merchant Name',
        value: 'visaMerchantName',
        fixed: true,
        checked: true,
        sortable: true,
      });
      this.columns.splice(3, 0, {
        label: 'Visa Store Name',
        value: 'visaStoreName',
        checked: true,
        sortable: true,
      });
      this.columns.splice(4, 0, {
        label: 'Address',
        value: 'merchantStreetAddress',
        checked: true,
      });
    }

    this.sortBy = Array(this.columns.length)
      .fill('-ascending', 0, 1)
      .fill('', 1);

    this.dataPool
      .getMerchantData()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res) {
            this.communityCode = res.data.communityCode;
            this.merchantGroupId = res.data.id;
            this.merchantGroupType = res.data.merchantGroupType;
            this.merchantActive = res.data.isActive;
            this.merchantGroupName = res.data.name;

            this.searchMerchant();
          } else {
            this.loading = true;
          }
        },
      });

    this.dataPool
      .getSelectedMerchant()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.groupId = res.id;
        },
      });

    this.status.getPanelStatus.pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        this.isPanelOpen = res;

        if (!this.isPanelOpen && !this.searchActivate) {
          this.clearSearch();
        }
      },
    });

    this.searchPanel.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        if (JSON.stringify(res) != JSON.stringify(this.prevSearchValue)) {
          if (this.searchActivate) {
            this.search();
          }
        }
      });
  }

  ngOnInit(): void {
    this.navStatusService.setOverlayStatus(true);
  }

  convertTimeZone(date: string) {
    const convertedDate = DateUtils.formatDateTime(
      moment.utc(date, DateTimeFormat.MOMENT_YYYY_MM_DD_TIME).local(),
      DateTimeFormat.MOMENT_YYYY_MM_DD_TIME
    );

    return convertedDate == 'Invalid date' ? null : convertedDate;
  }

  openPanel() {
    this.status.togglePanel(true);
    this.searchActivate = false;
  }

  search() {
    this.searchActivate = true;
    this.status.togglePanel(false);
    this.activeFilters = [];
    Object.keys(this.searchPanel.controls).map((key) => {
      if (!!this.searchPanel.get(key)?.value) this.activeFilters.push(key);
    });

    if (this.activeFilters.length === 0) {
      this.searchActivate = false;
    }
    this.searchMerchant();
  }

  clearSearch() {
    this.searchActivate = false;

    Object.keys(this.searchPanel.controls).map(key => {
      this.searchPanel.get(key)?.reset();
    });

    if (
      JSON.stringify(this.prevSearchValue) !=
      JSON.stringify(this.searchPanel.getRawValue())
    ) {
      this.searchMerchant();
    }
  }
  dateChange(e: any, section: string) {

    if (Utils.isNull(this.searchPanel.get(section)?.value)) {
      if (section === 'startDate') {
        this.searchPanel.get('startTime')?.setValue(EMPTY);
      } else {
        this.searchPanel.get('endTime')?.setValue(EMPTY);
      }
    }
  }

  selectAllHandler(e: any) {
    const validClick = (e.target as HTMLInputElement).classList.contains(
      'vds-checkbox'
    );

    if (validClick) {
      if ((e.target as HTMLInputElement).checked) {
        this.selectedIndex = this.tableData.map((data, i) => i);
        this.selectedMerchants = [...this.tableData];
      } else {
        this.selectedIndex = [];
        this.selectedMerchants = [];
      }
    }
  }

  checkboxHandler(e: any, index: number, row: any) {
    if (!e.checked) {
      this.selectedIndex = this.selectedIndex.filter((i) => i !== index);
      this.selectedMerchants = this.selectedMerchants.filter(
        (s) => s[this.columns[0].value] !== row[this.columns[0].value]
      );
    } else if (e.checked && !this.selectedIndex.includes(index)) {
      this.selectedIndex = [...this.selectedIndex, index];
      this.selectedMerchants = [...this.selectedMerchants, row];
    }
  }

  handleSort(col: string, indx: number) {
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
    this.searchMerchant();
  }

  // common method for managing merchant activation and deactivation
  private manageMerchants(action: 'activate' | 'deactivate') {
    const merchantKey =
      this.merchantGroupType == 'MerchantInfo'
        ? 'merchantDetails'
        : 'merchantAcquirerDetails';

    const payload = {
      merchantGroupName: this.merchantGroupName,
      communityCode: this.communityCode,
      merchantGroupId: this.groupId,
    };

    (payload as any)[merchantKey] = this.selectedMerchants.map((m) =>
      this.merchantGroupType == 'MerchantInfo'
        ? {
          visaMerchantId: m.visaMerchantId,
          visaStoreId: m.visaStoreId,
          ...(action === 'activate' && {
            externalId: m.externalId,
            startDateInMerchantGroup: DateUtils.formatDateTime(
              m.startDateInMerchantGroup,
              DateTimeFormat.MOMENT_YYYY_MM_DD_TIME
            ),
            endDateInMerchantGroup: DateUtils.formatDateTime(
              m.endDateInMerchantGroup,
              DateTimeFormat.MOMENT_YYYY_MM_DD_TIME
            ),
          }),
        }
        : {
          cardAcceptorId: m.cardAcceptorId,
          acquirerBin: m.acquirerBin,
          ...(action === 'activate' && {
            externalId: m.externalId,
            startDateInMerchantGroup: DateUtils.formatDateTime(
              m.startDateInMerchantGroup,
              DateTimeFormat.MOMENT_YYYY_MM_DD_TIME
            ),
            endDateInMerchantGroup: DateUtils.formatDateTime(
              m.endDateInMerchantGroup,
              DateTimeFormat.MOMENT_YYYY_MM_DD_TIME
            ),
          }),
        }
    );

    const dialogRef: any =
      action === 'activate'
        ? ActivateConfirmDialogComponent
        : DeactivateConfirmDialogComponent;

    this.dialog
      .open(dialogRef, {
        hasBackdrop: true,
        disableClose: true,
        ariaLabel: 'confirm-dialog',
        data: payload,
      })
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        if (result) {
          if (result.status === 'activate' || result.status === 'deactivate') {
            this.alertService.setAlertData({
              title: `Selected merchants ${result.status}d.`,
              message: `Selected merchants ${result.status}d.`,
              type: AlertType.SUCCESS,
            });

            // this.dataPool.refreshRequest.next('merchant');
            this.searchMerchant();
          }

          if (result.status == 'updated') {
            this.alertService.setAlertData({
              title: `Selected merchants ${result.status}`,
              message: `Selected merchants Start Date and End Date ${result.status}.`,
              type: AlertType.SUCCESS,
            });

            this.searchMerchant();
          }
        }
      });
  }

  activateMerchants() {
    this.manageMerchants('activate');
  }

  deactivateMerchants() {
    this.manageMerchants('deactivate');
  }

  private getSelectedMerchants(): any[] {
    return (this.selectedMerchants || []).map(item => {
      return (
        {
          externalId: item.externalId,
          startDateInMerchantGroup: item?.startDateInMerchantGroup,
          endDateInMerchantGroup: item?.endDateInMerchantGroup,
          ...(
            (this.merchantGroupType === MerchantGroupType.VMID_VSID)
              ? {
                visaMerchantId: item?.visaMerchantId,
                visaStoreId: item?.visaStoreId
              }
              : {
                acquirerBin: item?.acquirerBin,
                cardAcceptorId: item?.cardAcceptorId
              }
          )

        }
      );
    });

  }

  openEditModal() {
    this.dialog.open(
      UpdateDateModalComponent,
      {
        data: {
          merchantGroupName: this.merchantGroupName,
          merchantGroupType: this.merchantGroupType,
          communityCode: this.communityCode,
          merchantGroupId: this.merchantGroupId,
          merchantDetails: this.merchantGroupType === MerchantGroupType.VMID_VSID ? this.getSelectedMerchants() : [],
          merchantAcquirerDetails: this.merchantGroupType === MerchantGroupType.BIN_CAID ? this.getSelectedMerchants() : []
        },
        ariaLabel: 'dialog-title',
        hasBackdrop: true,
        disableClose: true,
      }
    ).afterClosed().pipe(takeUntil(this.destroy$)).subscribe((result) => {
      if (result) {
        if (result.status == 'updated') {
          this.alertService.setAlertData({
            title: `Selected merchants ${result.status}`,
            message: `Selected merchants Start Date and End Date ${result.status}.`,
            type: AlertType.SUCCESS,
          });

          this.searchMerchant();
        }
      }
    });
  }

  searchMerchant() {
    this.loading = true;
    this.tableData = [];
    this.selectedMerchants = [];
    this.selectedIndex = [];
    const keysNotToFilter = ['startTime', 'endTime'];

    let formValues = Object.fromEntries(
      Object.entries(this.searchPanel.getRawValue()).filter(
        ([key, value]) => !keysNotToFilter.includes(key) && value
      )
    );

    if (this.activeFilters.includes('startDate')) {
      const date = DateUtils.formatDateTime(
        this.searchPanel.get('startDate')?.value,
        DateTimeFormat.MOMENT_YYYY_MM_DD
      );
      const dateTime = DateUtils.convertLocalDateTimeToUTCDateTime(
        `${date} ${this.searchPanel.get('startTime')?.value}`,
        this.DateFormat.YYYY_MM_DD_HH_MM_SS
      );

      formValues['startDate'] = dateTime;
    }

    if (this.activeFilters.includes('endDate')) {
      const date = DateUtils.formatDateTime(
        this.searchPanel.get('endDate')?.value,
        DateTimeFormat.MOMENT_YYYY_MM_DD
      );
      const dateTime = DateUtils.convertLocalDateTimeToUTCDateTime(
        `${date} ${this.searchPanel.get('endTime')?.value}`,
        this.DateFormat.YYYY_MM_DD_HH_MM_SS
      );

      formValues['endDate'] = dateTime;
    }

    this.prevSearchValue = { ...this.searchPanel.getRawValue() };

    const param = {
      communityCode: this.communityCode,
      merchantGroupId: this.merchantGroupId,
      merchantGroupType: this.merchantGroupType,
      page: this.page,
      size: this.size,
      sort: `${this.sortColumnName},${this.sortColumnType}`,

      ...(this.searchActivate && formValues),
    };

    this.http
      .get('api/merchantgroup/searchMerchantGroupLists', param)
      .subscribe({
        next: (res: any) => {
          this.loading = false;

          res = JSON.parse(res.body);
          this.totalElements = res.page.totalElements;
          this.dataPool.setMerchantCount(this.totalElements);

          if (res.data) {
            this.tableData =
              res.data[
              this.merchantGroupType == 'MerchantInfo'
                ? 'merchantDetails'
                : 'acquirerDetails'
              ];
          }
        },
        error: (err) => {
          console.log(err);
          this.loading = false;
        },
      });
  }

  handlePagination(e: any) {
    this.page = e.pageIndex;
    this.size = e.pageSize; //not necessary

    this.searchMerchant();
  }

  download() {
    let formValues = Object.fromEntries(
      Object.entries(this.searchPanel.getRawValue()).filter(([_, v]) => v)
    );

    const param = {
      communityCode: this.communityCode,
      merchantGroupId: this.merchantGroupId,
      merchantGroupType: this.merchantGroupType,
      page: this.page,
      size: this.size,
      sort: `${this.sortColumnName},${this.sortColumnType}`,
      isDownload: true,
      timezone: moment.tz.guess(),
      ...(this.searchActivate && formValues),
    };

    this.http
      .get('api/merchantgroup/searchMerchantGroupLists', param)
      .subscribe({
        next: (res: any) => {
          let blob = new Blob([res.body], { type: 'text/csv' });
          let fileName: string = res.headers
            .get('content-disposition')
            .split('=')
            .pop();

          let downloadLink = document.createElement('a');
          downloadLink.href = window.URL.createObjectURL(blob);
          downloadLink.setAttribute('download', fileName);
          downloadLink.click();
        },
        error: (err) => {
          console.log(err);
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    // this.navStatusService.setOverlayStatus(false);
  }
}
