import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ButtonIconType, TooltipPosition } from '@visa/vds-angular';
import { EMPTY } from 'src/app/core/constants';
import { AddMerchantService } from 'src/app/services/private/add-merchant.service';
import { DateUtils } from 'src/app/services/util/dateUtils';
import { FunctionsService } from 'src/app/services/util/functions.service';
import { Utils } from 'src/app/services/utils';

@Component({
  selector: 'app-vsid-data-table',
  templateUrl: './vsid-data-table.component.html',
  styleUrls: ['./vsid-data-table.component.scss']
})
export class VsidDataTableComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() tableData: any[] = [];

  tableId: string = 'Merchant Groups List';
  caption: string = EMPTY;

  TooltipPosition = TooltipPosition;
  ButtonIconType = ButtonIconType;
  timeZone = DateUtils.getTimeZone();

  alphaNumeric = new RegExp('^$|[0-9a-zA-Z]+$');

  columns = [
    {
      label: 'VMID',
      value: 'visaMerchantId',
      checked: true,
      sortable: true
    },
    {
      label: 'Visa Merchant Name',
      value: 'visaMerchantName',
      checked: true,
      sortable: true
    },
    {
      label: 'VSID',
      value: 'visaStoreId',
      checked: true,
      sortable: true
    },
    {
      label: 'Visa Store Name',
      value: 'visaStoreName',
      checked: true,
      sortable: true
    },
    {
      label: 'External Id',
      value: 'externalId',
      sortable: false,
      checked: true
    },
    {
      label: 'Start Date',
      value: 'startDate',
      sortable: false,
      checked: true
    },
    {
      label: 'End Date',
      value: 'endDate',
      sortable: false,
      checked: true
    },
    {
      label: 'Address',
      value: 'merchantStreetAddress',
      checked: true,
      sortable: true
    },
    {
      label: 'City',
      value: 'merchantCity',
      checked: true,
      sortable: true
    },
    {
      label: 'State',
      value: 'merchantState',
      checked: true,
      sortable: true
    },
    {
      label: 'Country',
      value: 'merchantCountryCode',
      checked: true,
      sortable: true
    },
    {
      label: 'Postal Code',
      value: 'merchantPostalCode',
      checked: true,
      sortable: true
    }
  ];
  sortBy = Array(this.columns.length).fill('');

  selectedIndex: number[] = [];
  previousdata = this.selectedIndex;

  extraInfo: {
    externalId: string;
    startDateInMerchantGroup: string;
    endDateInMerchantGroup: string;
  }[] = [];

  isAcquirerInfoMerchantType: boolean = false;

  constructor(
    private functions: FunctionsService,
    private merchantDataPool: AddMerchantService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    if (this.route.snapshot.queryParams['type'] === 'AcquirerInfo') {
      this.isAcquirerInfoMerchantType = true;
      this.updateTableDataWithBinCaid();
    }

    this.tableData.map(() => {
      this.extraInfo.push({
        externalId: '',
        startDateInMerchantGroup: '',
        endDateInMerchantGroup: ''
      });
    });
  }

  updateTableDataWithBinCaid() {
    this.columns.splice(4, 0,
      {
        label: 'BIN',
        value: 'bin',
        checked: true,
        sortable: false
      },
      {
        label: 'CAID',
        value: 'caid',
        checked: true,
        sortable: false
      }
    );

    this.tableData = this.merchantDataPool.addBinCaidTableDataColumns(this.tableData);
  }

  ngAfterViewInit(): void {
    this.caption = Utils.generateCaptionMessage(this.columns, this.tableId);
  }

  assingValue(e: Event, i: number) {
    this.extraInfo[i].externalId = (e.target as HTMLInputElement).value;
    this.sendData();
  }
  selectDate(e: string, value: string, i: number) {
    switch (value) {
      case 'start':
        this.extraInfo[i].startDateInMerchantGroup = e;
        this.sendData();
        break;
      case 'end':
        this.extraInfo[i].endDateInMerchantGroup = e;
        this.sendData();
        break;
    }
  }

  selectAllHandler(e: Event) {
    const validClick = (e.target as HTMLInputElement).classList.contains(
      'vds-checkbox'
    );

    if (validClick) {
      if ((e.target as HTMLInputElement).checked) {
        this.selectedIndex = this.tableData.map((data, i) => {
          if (this.isAcquirerInfoMerchantType) {
            return (data.bin !== '-' && data.caid !== '-') ? i : null;
          }
          return i;
        }).filter(i => i !== null) as number[];
      } else this.selectedIndex = [];
    }

    this.selectedMerchantData();
  }

  checkboxHandler(e: any, index: number) {
    if (!e.checked)
      this.selectedIndex = this.selectedIndex.filter(i => i !== index);
    else if (e.checked && !this.selectedIndex.includes(index))
      this.selectedIndex = [...this.selectedIndex, index];

    this.selectedMerchantData();
  }

  handleSort(col: string, i: number) {
    let sortResponse: {
      array: any;
      iconArr: string[];
    };

    sortResponse = this.functions.sortArray(
      this.tableData,
      col,
      i,
      this.sortBy
    );

    this.tableData = sortResponse.array;
    this.sortBy = sortResponse.iconArr;
  }

  selectedMerchantData() {
    if (
      JSON.stringify(this.previousdata) != JSON.stringify(this.selectedIndex)
    ) {
      this.previousdata = this.selectedIndex;
      this.sendData();
    }
  }

  sendData() {
    let sendingValue: object[] = [];

    sendingValue = this.selectedIndex.map((res: number) => {
      if (this.route.snapshot.queryParams['type'] === 'AcquirerInfo') {
        return {
          acquirerBin: this.tableData[res]?.bin,
          cardAcceptorId: this.tableData[res]?.caid,
          ...this.extraInfo[res]
        }
      }
      return {
        visaMerchantId: this.tableData[res].visaMerchantId,
        visaStoreId: this.tableData[res].visaStoreId,
        ...this.extraInfo[res]
      };
    });

    this.merchantDataPool.setMerchantData(sendingValue);
  }

  ngOnDestroy(): void {
    this.merchantDataPool.setMerchantData([]);
  }
}
