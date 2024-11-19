import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import {
  BadgeType,
  ButtonColor,
  ButtonIconType,
  TooltipPosition
} from '@visa/vds-angular';
import { isBefore, isValid } from 'date-fns';
import { AddMerchantService } from 'src/app/services/private/add-merchant.service';
import { FunctionsService } from 'src/app/services/util/functions.service';
import { DateUtils } from 'src/app/services/util/dateUtils';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-vmid-data-table',
  templateUrl: './vmid-data-table.component.html',
  styleUrls: ['./vmid-data-table.component.scss']
})
export class VmidDataTableComponent implements OnInit, OnDestroy {
  @Input() tableData: any[] = [];

  ButtonColor = ButtonColor;
  BadgeType = BadgeType;
  TooltipPosition = TooltipPosition;
  ButtonIconType = ButtonIconType;
  alphaNumeric = new RegExp('^$|[0-9a-zA-Z]+$');
  timeZone = DateUtils.getTimeZone();

  columns = [
    {
      label: 'VMID',
      value: 'vmid',
      sortable: true,
      checked: true
    },
    {
      label: 'Visa Merchant Name',
      value: 'visaMerchantName',
      sortable: true,
      checked: true
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
    }
  ];
  sortBy = Array(this.columns.length).fill('');

  selectedIndex: number[] = [];
  previousdata = this.selectedIndex;

  DateRange: {
    sDate: Date | undefined;
    eDate: Date | undefined;
    isValid: boolean;
  }[] = [];

  extraInfo: {
    externalId: string;
    startDateInMerchantGroup: string;
    endDateInMerchantGroup: string;
  }[] = [];
  acquirerMerchantType: boolean = false;

  constructor(
    private functions: FunctionsService,
    private merchantDataPool: AddMerchantService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    if (this.route.snapshot.queryParams['type'] === 'AcquirerInfo') {
      this.acquirerMerchantType = true;
      this.updateTableDataWithBinCaid();
    }

    this.tableData.map(() => {
      this.extraInfo.push({
        externalId: '',
        startDateInMerchantGroup: '',
        endDateInMerchantGroup: ''
      });

      this.DateRange.push({
        sDate: undefined,
        eDate: undefined,
        isValid: true
      });
    });
  }

  updateTableDataWithBinCaid() {
    this.columns.splice(2, 0,
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

  assingValue(e: Event, i: number) {
    this.extraInfo[i].externalId = (e.target as HTMLInputElement).value;
    this.sendData();
  }
  selectDate(e: string, value: string, i: number) {
    switch (value) {
      case 'start':
        this.extraInfo[i].startDateInMerchantGroup = e;
        this.DateRange[i].sDate = new Date(e);
        this.sendData();
        break;
      case 'end':
        this.extraInfo[i].endDateInMerchantGroup = e;
        this.DateRange[i].eDate = new Date(e);
        this.sendData();
        break;
    }

    if (this.DateRange[i].eDate) {
      if (this.DateRange[i].sDate) {
        this.DateRange[i].isValid = isBefore(
          this.DateRange[i].sDate!,
          this.DateRange[i].eDate!
        );
      } else {
        this.DateRange[i].isValid = false;
      }
    } else {
      this.DateRange[i].isValid = true;
    }
  }

  selectAllHandler(e: Event) {
    const validClick = (e.target as HTMLInputElement).classList.contains(
      'vds-checkbox'
    );

    if (validClick) {
      if ((e.target as HTMLInputElement).checked) {
        this.selectedIndex = this.tableData.map((data, i) => {
          if (this.acquirerMerchantType) {
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
          acquirerBin: this.tableData[res].bin,
          cardAcceptorId: this.tableData[res].caid,
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
