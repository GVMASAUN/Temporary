import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import {
  ButtonColor,
  ButtonIconType,
  TooltipPosition
} from '@visa/vds-angular';
import { isBefore } from 'date-fns';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EMPTY } from 'src/app/core/constants';
import { NavStatusService } from 'src/app/services/nav-status/nav-status.service';
import { FunctionsService } from 'src/app/services/util/functions.service';
import { Utils } from 'src/app/services/utils';

@Component({
  selector: 'app-history-menu',
  templateUrl: './history-menu.component.html',
  styleUrls: ['./history-menu.component.scss']
})
export class HistoryMenuComponent implements OnInit, OnDestroy, AfterViewInit {
  private destroy$ = new Subject<void>();

  ButtonIconType = ButtonIconType;
  ButtonColor = ButtonColor;
  TooltipPosition = TooltipPosition;

  footerOpen: boolean = false;
  selectAllRows: boolean = false;
  loading: boolean = false;
  isPanelOpen: boolean = false;
  searchActivate: boolean = false;
  isErrorOccured: boolean = false;

  tableId: string = 'Clients List';
  caption: string = EMPTY;


  historyData: any[] = [];
  tableData: any[] = [];
  activeFilters: string[] = [];
  selectedIndex: number[] = [];
  columns = [
    {
      label: 'Action Type',
      value: 'actionType',
      checked: true,
      sortable: true
    },
    {
      label: 'Modified Date Time',
      value: 'modifiedDate',
      checked: true,
      sortable: true
    },
    {
      label: 'Responsible User',
      value: 'user',
      checked: true,
      sortable: true
    }
  ];

  sortBy: string[] = Array(this.columns.length).fill(EMPTY);

  prevSearchValue = { actionType: EMPTY, user: EMPTY, sDate: EMPTY, eDate: EMPTY };

  planError: any = {
    actionType: { type: EMPTY, error: EMPTY },
    user: { type: EMPTY, error: EMPTY },
    sDate: { type: EMPTY, error: 'Start Date must be before End Date' },
    eDate: { type: EMPTY, error: 'End Date must be after Starf Date' }
  };

  filterForm = this.fb.group({
    actionType: EMPTY,
    user: EMPTY,
    sDate: undefined,
    eDate: undefined
  });

  constructor(
    private functions: FunctionsService,
    private status: NavStatusService,
    private fb: UntypedFormBuilder,
    private navStatusService: NavStatusService
  ) {
    this.status.getPanelStatus
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: res => {
          this.isPanelOpen = res;

          if (!this.isPanelOpen && !this.searchActivate) {
            this.clearSearch();
          }
        }
      });

    this.filterForm.valueChanges
      .pipe(takeUntil(this.destroy$)).subscribe(res => {
        if (JSON.stringify(res) != JSON.stringify(this.prevSearchValue)) {
          if (this.searchActivate) {
            this.search();
          }
        }
      });

  }

  ngOnInit(): void {
    this.navStatusService.setOverlayStatus(true);
  }

  ngAfterViewInit() {
    this.caption = Utils.generateCaptionMessage(this.columns, this.tableId);
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

  openPanel() {
    this.status.togglePanel(true);
  }

  selectDate() {
    let error = isBefore(
      this.filterForm.getRawValue().eDate,
      this.filterForm.getRawValue().sDate
    );

    this.isErrorOccured = error;

    this.planError.sDate.type = 'date';
    this.planError.eDate.type = 'date';
  }

  search() {
    this.searchActivate = true;
    this.status.togglePanel(false);
    this.activeFilters = [];
    Object.keys(this.filterForm.controls).map(key => {
      if (!!this.filterForm.get(key)?.value) this.activeFilters.push(key);
    });

    this.searchHistory();
  }

  clearSearch() {
    this.searchActivate = false;

    this.filterForm.reset({
      actionType: '',
      user: '',
      sDate: undefined,
      eDate: undefined
    });

    if (
      JSON.stringify(this.prevSearchValue) !=
      JSON.stringify(this.filterForm.getRawValue())
    ) {
      this.searchHistory();
    }
  }

  searchHistory() {
    console.log('api hit');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    // this.navStatusService.setOverlayStatus(false);
  }
}
