import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AlertType,
  BadgeType,
  ButtonColor,
  ButtonIconType,
  TooltipPosition
} from '@visa/vds-angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EMPTY } from 'src/app/core/constants';
import { HttpService } from 'src/app/services/http/http.service';
import { NavStatusService } from 'src/app/services/nav-status/nav-status.service';
import { CreateDataService } from 'src/app/services/private/create-data.service';
import { ToggleAlertService } from 'src/app/services/toggle-alert/toggle-alert.service';
import { FunctionsService } from 'src/app/services/util/functions.service';
import { ActivateConfirmDialogComponent } from '../activate-confirm-dialog/activate-confirm-dialog.component';
import { DeactivateConfirmDialogComponent } from '../deactivate-confirm-dialog/deactivate-confirm-dialog.component';
import { Utils } from 'src/app/services/utils';
@Component({
  selector: 'app-create-merchants',
  templateUrl: './create-merchants.component.html',
  styleUrls: ['./create-merchants.component.scss']
})
export class CreateMerchantsComponent implements OnInit, AfterViewInit, OnDestroy {
  private destroy$ = new Subject<void>();

  ButtonColor = ButtonColor;
  BadgeType = BadgeType;
  TooltipPosition = TooltipPosition;
  ButtonIconType = ButtonIconType;

  merchantGroupName: string = EMPTY;
  communityCode: string = EMPTY;
  tableId: string = 'Merchant Groups List';
  caption: string = EMPTY;
  loading: boolean = false;

  addedMerchants: any[] = [];
  selectedMerchants: any[] = [];
  columns: any = [];
  sortBy!: string[];
  selectedIndex: number[] = [];

  merchantType!: string;
  col1 = { label: EMPTY, value: EMPTY };
  col2 = { label: EMPTY, value: EMPTY };

  constructor(
    private functions: FunctionsService,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpService,
    private dataService: CreateDataService,
    private status: NavStatusService,
    private alertService: ToggleAlertService,
    private dialog: MatDialog
  ) {
    let data = this.dataService.createMerchantData.getValue();
    this.merchantType = data?.type || '';
    this.merchantGroupName = data?.name || data?.merchantGroupName || '';
    if (!this.merchantGroupName)
      this.merchantGroupName = route.snapshot.params['id'] || 'NotFound';

    if (!this.merchantType)
      this.merchantType = route.snapshot.queryParams['type'] || 'MerchantInfo';
    this.communityCode = route.snapshot.queryParams['client'] || '';

    if (this.merchantType == 'MerchantInfo') {
      this.col1.label = 'VMID';
      this.col1.value = 'visaMerchantId';
      this.col2.label = 'VSID';
      this.col2.value = 'visaStoreId';
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
        sortable: true
      },
      {
        label: this.col2.label,
        value: this.col2.value,
        checked: true,
        sortable: true
      },
      {
        label: 'Status',
        value: 'isActive',
        checked: true,
        sortable: true
      },
      {
        label: 'External ID',
        value: 'externalId',
        checked: true,
        sortable: true
      },
      {
        label: 'Start Date',
        value: 'startDateInMerchantGroup',
        checked: true,
        sortable: true
      },
      {
        label: 'End Date',
        value: 'endDateInMerchantGroup',
        checked: true,
        sortable: true
      },
      {
        label: 'Last Modified Date',
        value: 'modifiedDate',
        checked: true,
        sortable: true
      }
    ];

    this.sortBy = Array(this.columns.length).fill('');


  }

  private showSuccess(result: string) {
    this.alertService.setAlertData({
      title: `Selected merchants ${result}d.`,
      message: `Selected merchants ${result}d.`,
      type: AlertType.SUCCESS
    });
    this.getMerchants();
    this.selectedMerchants = [];
    this.selectedIndex = [];
  }


  ngOnInit(): void {
    // if (!data) {
    //   this.router.navigate(['/merchant']);
    // }
    this.status.setOverlayStatus(true);

    this.getMerchants();
  }

  ngAfterViewInit(): void {
    this.caption = Utils.generateCaptionMessage(this.columns, this.tableId);
  }

  getMerchants() {
    this.loading = true;
    this.addedMerchants = [];
    let param = {
      merchantGroupName: this.merchantGroupName,
      merchantGroupType: this.merchantType,
      communityCode: this.communityCode
    };
    this.http.get('api/merchantgroup/viewMerchantGroup', param).subscribe({
      next: (res: any) => {
        res = JSON.parse(res.body);

        if (this.merchantType == 'MerchantInfo') res = res.data.merchantDetails;
        else res = res.data.acquirerDetails;

        this.addedMerchants = res;
        this.loading = false;
      },
      error: err => {
        console.log(err);
        this.loading = false;
      }
    });
  }

  deactivateMerchants() {
    let merchantKey =
      this.merchantType == 'MerchantInfo'
        ? 'merchantDetails'
        : 'merchantAcquirerDetails';
    let payload = {
      merchantGroupName: this.merchantGroupName
    };
    (payload as any)[merchantKey] = this.selectedMerchants.map(m =>
      this.merchantType == 'MerchantInfo'
        ? {
          visaMerchantId: m.visaMerchantId,
          visaStoreId: m.visaStoreId
        }
        : {
          cardAcceptorId: m.cardAcceptorId,
          acquirerBin: m.acquirerBin
        }
    );

    const dialogRef = this.dialog.open(
      DeactivateConfirmDialogComponent,
      {
        hasBackdrop: true, disableClose: true,
        ariaLabel: 'confirm-deactivate-dialog',
        data: payload
      });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => this.showSuccess(result)
      );
  }

  activateMerchants() {
    let merchantKey =
      this.merchantType == 'MerchantInfo'
        ? 'merchantDetails'
        : 'merchantAcquirerDetails';
    let payload = {
      merchantGroupName: this.merchantGroupName
    };
    (payload as any)[merchantKey] = this.selectedMerchants.map(m =>
      this.merchantType == 'MerchantInfo'
        ? {
          visaMerchantId: m.visaMerchantId,
          visaStoreId: m.visaStoreId
        }
        : {
          cardAcceptorId: m.cardAcceptorId,
          acquirerBin: m.acquirerBin
        }
    );

    const dialogRef = this.dialog.open(ActivateConfirmDialogComponent, {
      hasBackdrop: true, disableClose: true,
      ariaLabel: 'confirm-activate-dialog',
      data: payload
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => this.showSuccess(result)
      );
  }

  selectAllHandler(e: Event) {
    const validClick = (e.target as HTMLInputElement).classList.contains(
      'vds-checkbox'
    );

    if (validClick) {
      if ((e.target as HTMLInputElement).checked) {
        this.selectedIndex = this.addedMerchants.map((data, i) => i);
        this.selectedMerchants = [...this.addedMerchants];
      } else {
        this.selectedIndex = [];
        this.selectedMerchants = [];
      }
    }
  }

  checkboxHandler(e: any, index: number, row: any) {
    if (!e.checked) {
      this.selectedIndex = this.selectedIndex.filter(i => i !== index);
      this.selectedMerchants = this.selectedMerchants.filter(
        s => s[this.columns[0].value] !== row[this.columns[0].value]
      );
    } else if (e.checked && !this.selectedIndex.includes(index)) {
      this.selectedIndex = [...this.selectedIndex, index];
      this.selectedMerchants = [...this.selectedMerchants, row];
    }
  }

  save() {
    return true;
    // return this.http
    //   .post(
    //     `api/merchantgroup/createMerchantGroup`,
    //     this.dataService.createMerchantData.getValue()
    //   )
    //   .subscribe({
    //     next: (res: any) => {
    //         return true;
    //
    //     },
    //     error: err => {
    //       console.log(err);
    //       return false;
    //     }
    //   });
  }

  saveAndExit() {
    if (this.save()) {
      this.router.navigate(['/merchant'], { queryParamsHandling: 'merge' });
    }
  }

  handleSort(col: string, i: number) {
    let sortResponse: {
      array: any;
      iconArr: string[];
    };

    sortResponse = this.functions.sortArray(
      this.addedMerchants,
      col,
      i,
      this.sortBy
    );

    this.addedMerchants = sortResponse.array;
    this.sortBy = sortResponse.iconArr;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    this.status.setOverlayStatus(false);
  }
}
