import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  BadgeType,
  ButtonColor,
  ButtonIconType,
  TooltipPosition
} from '@visa/vds-angular';
import * as moment from 'moment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DateTimeFormat } from 'src/app/core/constants';
import { NavStatusService } from 'src/app/services/nav-status/nav-status.service';
import { FunctionsService } from 'src/app/services/util/functions.service';
import { Utils } from 'src/app/services/utils';
import { mockTableList, tableHeader } from './constants';

@Component({
  selector: 'app-enrollment-collection',
  templateUrl: './enrollment-collection.component.html',
  styleUrls: ['./enrollment-collection.component.scss']
})
export class EnrollmentCollectionComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  buttonColor = ButtonColor;
  buttonIconType = ButtonIconType;
  tooltipPosition = TooltipPosition;
  badgeType = BadgeType;

  constructor(
    private functions: FunctionsService,
    private status: NavStatusService
  ) { }

  isPanelOpen: boolean = false;
  searchActivate: boolean = false;
  isNavOpen: boolean = true;

  timeZone = Utils.getTimeZone();

  tableHeader: any[] = [...tableHeader];
  tableList = [...mockTableList.data];
  originalList = this.tableList;

  sortBy = Array(this.tableHeader.length)
    .fill('-ascending', 0, 1)
    .fill('', 1);

  ngOnInit(): void {
    this.status.getPanelStatus.pipe(takeUntil(this.destroy$)).subscribe({
      next: res => {
        this.isPanelOpen = res;

        if (!this.isPanelOpen && !this.searchActivate) {
          this.clearSearch();
        }
      }
    });

    this.status
      .getNavigationStatus()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: res => {
          this.isNavOpen = res;
        }
      });
  }

  convertTimeZone(date: string) {
    const convertedDate = Utils.formatDateTime(
      moment.utc(date, DateTimeFormat.MOMENT_YYYY_MM_DD_TIME).local(),
      DateTimeFormat.MOMENT_YYYY_MM_DD_TIME
    );

    return convertedDate == 'Invalid date' ? null : convertedDate;
  }

  handleSort(col: string, i: number) {
    let sortResponse: {
      array: any;
      iconArr: string[];
    };

    sortResponse = this.functions.sortArray(
      this.tableList,
      col,
      i,
      this.sortBy
    );

    this.tableList = sortResponse.array;
    this.sortBy = sortResponse.iconArr;
  }

  openPanel() {
    this.status.togglePanel(true);
    this.searchActivate = false;
  }
  search() {
    this.searchActivate = true;
    this.status.togglePanel(false);
    // this.filterData();
  }
  clearSearch() {
    this.searchActivate = false;
    // this.filterForm.reset({
    //   name: EMPTY,
    //   status: EMPTY,
    //   type: EMPTY,
    //   id: EMPTY,
    //   sDate: undefined,
    //   eDate: undefined
    // });
    // this.filterData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
