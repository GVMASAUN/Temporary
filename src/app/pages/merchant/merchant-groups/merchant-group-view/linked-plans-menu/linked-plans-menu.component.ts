import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  ButtonColor,
  ButtonIconType,
  TooltipPosition
} from '@visa/vds-angular';
import { EMPTY } from 'src/app/core/constants';
import { NavStatusService } from 'src/app/services/nav-status/nav-status.service';
import { FunctionsService } from 'src/app/services/util/functions.service';

@Component({
  selector: 'app-linked-plans-menu',
  templateUrl: './linked-plans-menu.component.html',
  styleUrls: ['./linked-plans-menu.component.scss']
})
export class LinkedPlansMenuComponent implements OnInit, OnDestroy {
  ButtonIconType = ButtonIconType;
  ButtonColor = ButtonColor;
  TooltipPosition = TooltipPosition;

  footerOpen: boolean = false;
  selectAllRows: boolean = false;
  loading: boolean = false;

  tableData: any[] = [];
  selectedIndex: number[] = [];
  columns = [
    {
      label: 'Plan Name',
      value: 'plan-ame',
      checked: true,
      sortable: true
    },
    {
      label: 'Status',
      value: 'status',
      checked: true,
      sortable: true
    },
    {
      label: 'Start Date (GMT)',
      value: 'start-date',
      checked: true,
      sortable: true
    },
    {
      label: 'End Date (GMT)',
      value: 'end-date',
      checked: true,
      sortable: true
    },
    {
      label: 'Last Modified Date',
      value: 'last-edit',
      checked: true,
      sortable: true
    }
  ];

  sortBy: string[] = Array(this.columns.length).fill(EMPTY);

  constructor(
    private functions: FunctionsService,
    private navStatusService: NavStatusService
  ) { }

  ngOnInit(): void {
    this.navStatusService.setOverlayStatus(true);
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
