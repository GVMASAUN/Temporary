import { AfterViewInit, Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import {
  BadgeType,
  ButtonColor,
  ButtonIconType,
  SearchVariant,
  TooltipPosition
} from '@visa/vds-angular';
import { FunctionsService } from 'src/app/services/util/functions.service';
import { allVmidVsidData } from './constant';
import { EMPTY } from 'src/app/core/constants';
import { Utils } from 'src/app/services/utils';

@Component({
  selector: 'app-tab-vmid-vsid',
  templateUrl: './tab-vmid-vsid.component.html',
  styleUrls: ['./tab-vmid-vsid.component.scss']
})
export class TabVmidVsidComponent implements OnInit, AfterViewInit {
  ButtonColor = ButtonColor;
  ButtonIconType = ButtonIconType;
  BadgeType = BadgeType;
  TooltipPosition = TooltipPosition;
  SearchVariant = SearchVariant;

  showTableInput: boolean = false;
  addBinBtn: boolean = true;

  selectedTab: number = 0;

  comment: string = EMPTY;
  tableId: string = 'VMID-VSID List';
  caption: string = EMPTY;

  selections: any[] = [];
  allVmidVsid: any[] = [];
  selectedIndex: number[] = [];

  columns = [
    {
      label: 'VMID',
      value: 'vmid',
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
      value: 'vsid',
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
      label: 'External ID',
      value: 'externalId',
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
    },
    {
      label: 'Postal',
      value: 'postal',
      checked: true,
      sortable: true
    }
  ];

  sortBy = Array(this.columns.length).fill(EMPTY);

  constructor(private fb: UntypedFormBuilder, private functions: FunctionsService) {}

  binCaidObject = this.fb.group({
    bin: [EMPTY, Validators.required],
    caid: [EMPTY, Validators.required],
    externalId: [EMPTY, Validators.required],
    startDate: [EMPTY, Validators.required],
    endDate: [EMPTY, Validators.required]
  });

  ngOnInit(): void {
    this.allVmidVsid = allVmidVsidData;
  }

  ngAfterViewInit(): void {
    this.caption = Utils.generateCaptionMessage(this.columns, this.tableId);
  }

  setComment(comment: { value: string }) {
    this.comment = comment.value;
  }

  selectAllHandler() {
    this.selectedIndex = this.allVmidVsid.map((mm, i) => i);
    this.selections = [...this.allVmidVsid];
  }

  deselectAllHandler() {
    this.selectedIndex = [];
    this.selections = [];
  }

  selectRow(index: number) {
    this.selectedIndex = [...this.selectedIndex, index];
    this.selections = this.allVmidVsid.filter((m, i) =>
      this.selectedIndex.includes(i)
    );
  }
  
  deselectRow(index: number) {
    this.selectedIndex = this.selectedIndex.filter((m, i) => i !== index);
    this.selections = this.allVmidVsid.filter((m, i) =>
      this.selectedIndex.includes(i)
    );
  }

  handleSort(col: string, i: number) {
    let sortResponse: {
      array: any;
      iconArr: string[];
    };

    sortResponse = this.functions.sortArray(
      this.allVmidVsid,
      col,
      i,
      this.sortBy
    );

    this.allVmidVsid = sortResponse.array;
    this.sortBy = sortResponse.iconArr;
  }
}
