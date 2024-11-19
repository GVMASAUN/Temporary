import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import {
  ButtonColor,
  ButtonIconType,
  TooltipPosition
} from '@visa/vds-angular';
import { EMPTY } from 'src/app/core/constants';
import { NavStatusService } from 'src/app/services/nav-status/nav-status.service';
import { FunctionsService } from 'src/app/services/util/functions.service';
import { Utils } from 'src/app/services/utils';

@Component({
  selector: 'app-clients-menu',
  templateUrl: './clients-menu.component.html',
  styleUrls: ['./clients-menu.component.scss']
})
export class ClientsMenuComponent implements OnInit, OnDestroy, AfterViewInit {
  ButtonIconType = ButtonIconType;
  ButtonColor = ButtonColor;
  TooltipPosition = TooltipPosition;

  tableData: any[] = [];
  selectedIndex: number[] = [];

  loading: boolean = false;

  tableId: string = 'Clients List';
  caption: string = EMPTY;

  constructor(
    private functions: FunctionsService,
    private navStatusService: NavStatusService
  ) { }

  columns = [
    {
      label: 'Client Code',
      value: 'clientCode',
      checked: true,
      sortable: true
      // width: '15%'
    },
    {
      label: 'Primary Client Name',
      value: 'primaryClientName',
      checked: true,
      sortable: true
      // width: '15%'
    },
    {
      label: 'Primary Client',
      value: 'primaryClient',
      checked: true,
      sortable: true
      // width: '15%'
    },
    {
      label: 'Description',
      value: 'description',
      checked: true,
      sortable: true
    },
    {
      label: 'Effective',
      value: 'effective',
      checked: true,
      sortable: true
      // width: '10%'
    },
    {
      label: 'Status',
      value: 'status',
      checked: true,
      sortable: true
      // width: '10%'
    }
  ];
  sortBy: string[] = Array(this.columns.length).fill('');

  ngOnInit(): void {
    this.navStatusService.setOverlayStatus(true);
  }

  ngAfterViewInit(): void {
    this.caption = Utils.generateCaptionMessage(this.columns, this.tableId);
  }

  selectAllHandler(e: Event) {
    const validClick = (e.target as HTMLInputElement).classList.contains(
      'vds-checkbox'
    );

    if (validClick) {
      if ((e.target as HTMLInputElement).checked) {
        this.selectedIndex = this.tableData.map((data, i) => i);
      } else this.selectedIndex = [];
    }
  }

  checkboxHandler(e: any, index: number) {
    if (!e.checked)
      this.selectedIndex = this.selectedIndex.filter(i => i !== index);
    else if (e.checked && !this.selectedIndex.includes(index))
      this.selectedIndex = [...this.selectedIndex, index];
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

  ngOnDestroy(): void {
    // this.navStatusService.setOverlayStatus(false);
  }
}
