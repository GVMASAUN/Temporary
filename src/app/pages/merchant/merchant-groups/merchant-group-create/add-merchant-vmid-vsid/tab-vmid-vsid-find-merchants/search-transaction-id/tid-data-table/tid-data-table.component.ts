import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ButtonIconType, TooltipPosition } from '@visa/vds-angular';
import { EMPTY } from 'src/app/core/constants';
import { AddMerchantService } from 'src/app/services/private/add-merchant.service';
import { FunctionsService } from 'src/app/services/util/functions.service';
import { Utils } from 'src/app/services/utils';

@Component({
  selector: 'app-tid-data-table',
  templateUrl: './tid-data-table.component.html',
  styleUrls: ['./tid-data-table.component.scss']
})
export class TidDataTableComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() tableData: any[] = [];

  tableId: string = 'Merchant Groups List';
  caption: string = EMPTY;

  TooltipPosition = TooltipPosition;
  ButtonIconType = ButtonIconType;

  columns = [
    {
      label: 'VMID',
      value: 'visaMerchantId',
      sortable: true,
      checked: true
    },
    {
      label: 'VSID',
      value: 'visaStoreId',
      sortable: true,
      checked: true
    },
    {
      label: 'MerchantName',
      value: 'visaMerchantName',
      checked: true,
      sortable: true
    },
    {
      label: 'Country',
      value: 'country',
      checked: true,
      sortable: true
    },
    {
      label: 'City',
      value: 'city',
      checked: true,
      sortable: true
    },
    {
      label: 'State',
      value: 'state',
      checked: true,
      sortable: true
    }
  ];
  sortBy = Array(this.columns.length).fill('');

  selectedIndex: number[] = [];
  previousdata = this.selectedIndex;
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
  }

  updateTableDataWithBinCaid() {
    this.columns.splice(1, 0,
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

  selectAllHandler(e: any) {
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
    let sendingValue: object[] = [];

    if (
      JSON.stringify(this.previousdata) != JSON.stringify(this.selectedIndex)
    ) {
      this.previousdata = this.selectedIndex;
      sendingValue = this.selectedIndex.map((res: number) => {
        if (this.route.snapshot.queryParams['type'] === 'AcquirerInfo') {
          return {
            acquirerBin: this.tableData[res].bin,
            cardAcceptorId: this.tableData[res].caid,
          }
        }
        return {
          visaMerchantId: this.tableData[res].visaMerchantId,
          visaStoreId: this.tableData[res].visaStoreId
        };
      });
      this.merchantDataPool.setMerchantData(sendingValue);
    }
  }

  ngOnDestroy(): void {
    this.merchantDataPool.setMerchantData([]);
  }
}
