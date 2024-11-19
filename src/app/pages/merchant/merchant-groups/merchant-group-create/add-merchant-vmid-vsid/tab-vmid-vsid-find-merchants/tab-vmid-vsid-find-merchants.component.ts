import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import {
  BadgeType,
  ButtonColor,
  ButtonIconType,
  RadioChange
} from '@visa/vds-angular';
import { isBefore } from 'date-fns';
import * as moment from 'moment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  DateTimeFormat,
  EMPTY,
  RUSULT_NOT_FOUND,
} from 'src/app/core/constants';
import { NavStatusService } from 'src/app/services/nav-status/nav-status.service';
import { AddMerchantService } from 'src/app/services/private/add-merchant.service';
import { TableDataCountService } from 'src/app/services/private/table-data-count.service';
import { Utils } from 'src/app/services/utils';
import { AddMerchantConfirmDialogComponent } from '../../add-merchant-confirm-dialog/add-merchant-confirm-dialog.component';
import { RequirementsComponent } from './search-vsid/requirements/requirements.component';
import { DateUtils } from 'src/app/services/util/dateUtils';
import { ToggleAlertService } from 'src/app/services/toggle-alert/toggle-alert.service';

@Component({
  selector: 'app-tab-vmid-vsid-find-merchants',
  templateUrl: './tab-vmid-vsid-find-merchants.component.html',
  styleUrls: ['./tab-vmid-vsid-find-merchants.component.scss'],
  providers: [AddMerchantService]
})
export class TabVmidVsidFindMerchantsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  alphaNumeric = new RegExp('^$|[0-9a-zA-Z]+$');

  ButtonColor = ButtonColor;
  ButtonIconType = ButtonIconType;
  badgeType = BadgeType;

  selectedSearch: string = 'vmid';
  groupName: string = EMPTY;
  groupId: string = EMPTY;

  addBtnEnable: boolean = false;
  isPanelOpen: boolean = false;

  panelSection: number = 0;
  showTable: number = 0;

  selectedIndex: number[] = [];
  merchantData: any[] = [];
  tableData: any[] = [];

  constructor(
    private merchantDataPool: AddMerchantService,
    private route: ActivatedRoute,
    private status: NavStatusService,
    private dataPool: TableDataCountService,
    private dialog: MatDialog,
    private readonly alertService: ToggleAlertService
  ) {
    this.status.getPanelStatus.pipe(takeUntil(this.destroy$)).subscribe({
      next: panelStatus => {
        this.isPanelOpen = panelStatus;
      }
    });

    this.dataPool
      .getSelectedMerchant()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.groupId = res.id;
        }
      });
  }

  ngOnInit(): void {
    this.groupName = this.route.snapshot.params['id'];

    this.merchantDataPool
      .getMerchantData()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: value => {
          this.merchantData = value;
          this.addBtnEnable = !!this.merchantData.filter((m: any) => {
            let sDate: Date | undefined = new Date(m.startDateInMerchantGroup);
            let eDate: Date | undefined = new Date(m.endDateInMerchantGroup);

            sDate = String(sDate) == 'Invalid Date' ? undefined : sDate;
            eDate = String(eDate) == 'Invalid Date' ? undefined : eDate;

            let isValid = true;
            if (eDate) {
              if (sDate) {
                isValid = isBefore(sDate, eDate);
              } else {
                isValid = false;
              }
            } else {
              isValid = true;
            }

            return isValid && this.alphaNumeric.test(m.externalId);
          }).length;
        }
      });
  }

  setTable(data: any) {
    this.tableData = data.tableData;
    this.showTable = data.tableNo;

    if ((this.tableData.length > 0)) {
      this.status.togglePanel(false);
    } else {
      this.alertService.showError(RUSULT_NOT_FOUND);
    }
  }

  addConfirmation() {
    for (var i in this.merchantData) {
      if (this.merchantData[i].endDateInMerchantGroup) {
        const tempDate = this.merchantData[i].endDateInMerchantGroup.split(' ');
        tempDate.splice(-1, 1, '23:59:59');
  
        this.merchantData[i].endDateInMerchantGroup = this.convertTimeZone(
          tempDate.join(' ')
        );
      }
      if (this.merchantData[i].startDateInMerchantGroup) {
        this.merchantData[i].startDateInMerchantGroup = this.convertTimeZone(
          this.merchantData[i].startDateInMerchantGroup
        );
      }
    }

    if (this.route.snapshot.queryParams['type'] === 'AcquirerInfo') {
      let sendingData = {
        merchantGroupName: this.groupName,
        merchantAcquirerDetails: this.merchantData.filter(
          row => row.acquirerBin !== '-' && row.cardAcceptorId !== '-'
        ),
        communityCode: this.route.snapshot.queryParams['client'],
        merchantGroupId: this.groupId
      };

      this.dialog.open(
        AddMerchantConfirmDialogComponent, {
        hasBackdrop: true, disableClose: true,
        ariaLabel: 'confirm-deactivate-dialog',
        data: {
          type: 'bin-caid',
          merchantData: sendingData
        }
      });
    } else if (this.route.snapshot.queryParams['type'] === 'MerchantInfo') {
      let sendingData: {
        merchantGroupName: string;
        merchantDetails: any[];
        comment?: string;
        communityCode: string;
        merchantGroupId: string;
      } = {
        merchantGroupName: this.groupName,
        merchantDetails: this.merchantData,
        communityCode: this.route.snapshot.queryParams['client'],
        merchantGroupId: this.groupId
      };

      this.dialog.open(
        AddMerchantConfirmDialogComponent,
        {
          hasBackdrop: true, disableClose: true,
          ariaLabel: 'confirm-add-merchant-dialog',
          data: {
            type: 'vmid-find-merchant',
            merchantData: sendingData
          }
        });
    }
  }

  selectSearchMethod(e: RadioChange) {
    this.selectedSearch = e.value;
  }

  openRequirements() {
    this.dialog.open(
      RequirementsComponent,
      {
        hasBackdrop: false,
        ariaLabel: 'requirement-component'
      }
    );
  }

  openPanel(option: number) {
    this.tableData = [];
    this.showTable = 0;
    this.panelSection = option;
    this.status.togglePanel(true);
  }

  convertTimeZone(date: string) {
    const convertedTime = DateUtils.formatDateTime(
      moment(` ${DateUtils.formatDateTime(date, DateTimeFormat.MOMENT_YYYY_MM_DD_TIME)}`).utc(),
      DateTimeFormat.MOMENT_YYYY_MM_DD_TIME
    );

    return convertedTime == 'Invalid date' ? '' : convertedTime;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
