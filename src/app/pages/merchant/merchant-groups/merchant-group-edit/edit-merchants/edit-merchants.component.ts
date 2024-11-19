import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  AlertType,
  BadgeType,
  ButtonColor,
  ButtonIconType,
  TooltipPosition
} from '@visa/vds-angular';
import { EMPTY, SUCCESS_CODE } from 'src/app/core/constants';
import { HttpService } from 'src/app/services/http/http.service';
import { NavStatusService } from 'src/app/services/nav-status/nav-status.service';
import { CreateDataService } from 'src/app/services/private/create-data.service';
import { ToggleAlertService } from 'src/app/services/toggle-alert/toggle-alert.service';
import { FunctionsService } from 'src/app/services/util/functions.service';
import { Utils } from 'src/app/services/utils';

@Component({
  selector: 'app-edit-merchants',
  templateUrl: './edit-merchants.component.html',
  styleUrls: ['./edit-merchants.component.scss']
})
export class EditMerchantsComponent implements OnInit, AfterViewInit {
  ButtonColor = ButtonColor;
  ButtonIconType = ButtonIconType;
  TooltipPosition = TooltipPosition;
  BadgeType = BadgeType;

  merchantType: string = 'MerchantInfo';
  merchantGroupName: string = EMPTY;
  caption: string = EMPTY;
  tableId:string = 'Clients List';

  loading: boolean = false;

  addedMerchants: any[] = [];
  selectedMerchants: any[] = [];
  selectedIndex: number[] = [];
  columns: any = [];
  sortBy: string[] = [];

  col1 = { label: EMPTY, value: EMPTY };
  col2 = { label: EMPTY, value: EMPTY };

  constructor(
    private functions: FunctionsService,
    private route: ActivatedRoute,
    private http: HttpService,
    private dataService: CreateDataService,
    private status: NavStatusService,
    private alert: ToggleAlertService
  ) {
    let data = this.dataService.createMerchantData.getValue();
    this.merchantType = data?.type || data?.merchantGroupType || '';
    this.merchantGroupName = data?.name || data?.merchantGroupName || '';

    if (!data) {
      // this.router.navigate(['/merchant']);
    }

    if (!this.merchantType)
      this.merchantType = route.snapshot.queryParams['type'] || 'MerchantInfo';
    if (!this.merchantGroupName)
      this.merchantGroupName = route.snapshot.params['id'] || 'DEMO';

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

  ngOnInit(): void {
    this.status.setOverlayStatus(true);
    this.getMerchants();
  }

  ngAfterViewInit() {
    this.caption = Utils.generateCaptionMessage(this.columns, this.tableId);
  }

  getMerchants() {
    this.loading = true;
    this.addedMerchants = [];
    let param = {
      merchantGroupName: this.merchantGroupName,
      merchantGroupType: this.merchantType
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
    this.http
      .post('api/merchantgroup/removeMerchantsFromGroup', payload)
      .subscribe({
        next: (res: any) => {
          this.getMerchants();
          this.selectedMerchants = [];
          this.selectedIndex = [];
        },
        error: err => {
          console.log(err);
        }
      });
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

    this.http.post('api/merchantgroup/addMerchantsToGroup', payload).subscribe({
      next: (res: any) => {
        res = JSON.parse(res.body);

        if ((res.statusCode === SUCCESS_CODE) && Utils.isNull(res.errors)) {
          this.getMerchants();
          this.selectedMerchants = [];
          this.selectedIndex = [];
        } else { 
          this.alert.showResponseErrors(res?.errors);
        }
      },
      error: err => {
        console.log(err);
      }
    });
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
}
