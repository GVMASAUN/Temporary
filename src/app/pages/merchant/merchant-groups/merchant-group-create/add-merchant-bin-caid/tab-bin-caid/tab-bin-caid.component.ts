import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { ButtonColor, ButtonIconType } from '@visa/vds-angular';
import { Subject } from 'rxjs';
import { DateTimeFormat, EMPTY, INVALID_DATE, REQUIRED_FIELD } from 'src/app/core/constants';
import { Utils } from 'src/app/services/utils';
import { AddMerchantConfirmDialogComponent } from '../../add-merchant-confirm-dialog/add-merchant-confirm-dialog.component';
import { ToggleAlertService } from 'src/app/services/toggle-alert/toggle-alert.service';
import { DateUtils } from 'src/app/services/util/dateUtils';


@Component({
  selector: 'app-tab-bin-caid',
  templateUrl: './tab-bin-caid.component.html',
  styleUrls: ['./tab-bin-caid.component.scss'],
  providers: [DatePipe]
})
export class TabBinCaidComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  ButtonColor = ButtonColor;
  ButtonIconType = ButtonIconType;

  showTableInput: boolean = false;
  addBinBtn: boolean = true;
  addBtnDisabled = true;

  merchantGroupName: string = EMPTY;
  tableId: string = 'Add via BIN-CAID List';
  endDateError: string = EMPTY;

  binCaid: any[] = [];

  DateTimeFormat = DateTimeFormat;
  EMPTY = EMPTY;
  INVALID_DATE = INVALID_DATE;

  constructor(
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private alertService: ToggleAlertService
  ) { }

  inputChange(e: any, i: number, key: string) {
    this.binCaid[i][key] = e.value.trim();
    this.addBtnDisabled = this.isDisabled();
  }

  isDisabled() {
    for (let i = 0; i < this.binCaid.length; i++) {
      if (this.binCaid[i].acquirerBin && this.binCaid[i].cardAcceptorId)
        return false;
    }
    return true;
  }

  ngOnInit(): void {
    this.merchantGroupName = this.route.snapshot.params['id'];
  }


  newBinCaid() {
    this.binCaid.push({
      acquirerBin: EMPTY,
      cardAcceptorId: EMPTY,
      externalId: EMPTY,
      startDateInMerchantGroup: EMPTY,
      endDateInMerchantGroup: EMPTY,
      startDateError: EMPTY,
      endDateError: EMPTY
    });
  }

  merchantDetails = JSON.parse(
    localStorage.getItem('selectedMerchant') || '{}'
  );

  selectDate(e: string, i: number, value: string) {
    let formattedDate: string = DateUtils.convertLocalDateTimeToUTCDateTime(e, DateTimeFormat.MOMENT_YYYY_MM_DD_TIME);

    switch (value) {
      case 'start':
        {
          if (formattedDate === INVALID_DATE) {
            this.binCaid[i]['startDateError'] = INVALID_DATE;
          } else {
            this.binCaid[i]['startDateError'] = EMPTY;
            this.binCaid[i]['startDateInMerchantGroup'] = formattedDate;
          }

          break;
        }

      case 'end':
        {
          if (formattedDate === INVALID_DATE) {
            this.binCaid[i]['endDateError'] = INVALID_DATE;
          } else {
            this.binCaid[i]['endDateError'] = EMPTY;

            this.binCaid[i]['endDateInMerchantGroup'] = formattedDate;
          }

          break;
        }
    }
  }

  private validateBins(): boolean {
    let isValid = true;

    for (const bin of this.binCaid) {
      if (Utils.isNotNull(bin['startDateInMerchantGroup']) &&
        Utils.isNull(bin['endDateInMerchantGroup'])
      ) {
        bin['endDateError'] = REQUIRED_FIELD;
        isValid = false;
      }

      if (Utils.isNotNull(bin['startDateError']) || Utils.isNotNull(bin['endDateError'])) {
        isValid = false;
      }
    }

    return isValid;
  }

  confirmAdd() {
    if (this.validateBins()) {
      let sendingData = {
        merchantGroupName: this.merchantGroupName,
        merchantAcquirerDetails: this.binCaid.filter(
          row => row.acquirerBin && row.cardAcceptorId
        ),
        communityCode: this.merchantDetails?.communityCode,
        merchantGroupId: this.merchantDetails?.id
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
    } else {
      this.alertService.showError();
    }
  }

  getTimeZone(): string {
    return DateUtils.getTimeZone();
  }

  removeBinCaid(index: number) {
    this.binCaid.splice(index, 1);
    this.addBtnDisabled = this.isDisabled();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
