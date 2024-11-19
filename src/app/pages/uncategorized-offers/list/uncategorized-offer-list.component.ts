import { Component, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SearchTableComponent } from 'src/app/shared/search-table/search-table.component';
import {
  SearchField,
  SearchFieldType,
  SearchTableAction,
  SearchTableColumn,
  SearchTableColumnType,
  SortDirection
} from 'src/app/shared/search-table/search-table.model';
import { StatusCode } from 'src/app/core/models/status.model';
import { GarbageCollectorService } from 'src/app/services/garbage-collector.service';
import { NavStatusService } from 'src/app/services/nav-status/nav-status.service';
import { UncategorizedOfferService } from 'src/app/services/uncategorized-offer/uncategorized-offer.service';

@Component({
  selector: 'app-uncategorized-offer-list',
  templateUrl: './uncategorized-offer-list.component.html',
  styleUrls: ['./uncategorized-offer-list.component.scss'],
})
export class UncategorizedOfferListComponent implements OnInit, OnDestroy {
  @ViewChild('uncategorizedOfferTable')
  uncategorizedOfferTable!: SearchTableComponent;

  private destroy$ = new Subject<void>();

  StatusCode = StatusCode;
 
  isPanelOpen: boolean = false;

  tableColumns: SearchTableColumn[] = [
    {
      key: 'offerName',
      label: 'Name',
      sortDirection: SortDirection.ASC,
      type: SearchTableColumnType.LINK,
      fixed: true,
      cellStyle: () => {
        return 'width: 20%'
      },
      click: (row) => {
        this.router.navigate(
          [
            'uncategorized-offers',
            'manage',
            row.offerId
          ],
          {
            queryParamsHandling: 'merge'
          }
        )
      }
    },
    {
      key: 'offerDescription',
      label: 'Description',
      cellStyle: () => {
        return 'width: 20%'
      }
    },
    {
      key: 'offerStartDate',
      label: 'Start Date',
      type: SearchTableColumnType.DATE
    },
    {
      key: 'offerEndDate',
      label: 'End Date',
      type: SearchTableColumnType.DATE
    },
    {
      key: 'enabledIndicator',
      label: 'Status',
      sortable: false,
      type: SearchTableColumnType.STATUS,
      mapValue: (row: any, component: SearchTableComponent) => {
        if (!row.enabledIndicator) {
          return StatusCode.INACTIVE;
        }
        return StatusCode.ACTIVE;
      }
    },
    {
      key: 'modifiedDate',
      label: 'Last Update',
      type: SearchTableColumnType.DATE
    }
  ];


  tableActions: SearchTableAction[] = [];


  advancedSearchFields: SearchField[] = [
    {
      key: 'offerName',
      label: 'Offer Name'
    },
    {
      key: 'offerStart',
      label: 'Effective Start Date',
      type: SearchFieldType.DATE
    },
    {
      key: 'offerEnd',
      label: 'Effective End Date',
      type: SearchFieldType.DATE
    },
    {
      key: 'updateFrom',
      label: 'Last Updated Date From',
      type: SearchFieldType.DATE
    },
    {
      key: 'updateTo',
      label: 'Last Updated Date To',
      type: SearchFieldType.DATE
    },
    {
      key: 'includeInactive',
      label: 'Include inactive offers',
      type: SearchFieldType.CHECKBOX
    }
  ];


  constructor(
    private router: Router,
    private navStatusService: NavStatusService,
    private offerService: UncategorizedOfferService,
    private viewContainerRef: ViewContainerRef
  ) { }


  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.registerOnChangeListeners();

    if (this.uncategorizedOfferTable) {
      this.uncategorizedOfferTable.advancedSearchForm
        .get('includeInactive')?.patchValue(false);
    }
  }

  private registerOnChangeListeners() {
    this.navStatusService.getPanelStatus
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: panelStatus => {
          this.isPanelOpen = panelStatus;
        }
      });
  }

  getUncategorizedOffersList(filters: any = {}) {
    let includeInactive;

    if (this.uncategorizedOfferTable) {
      includeInactive =
        this.uncategorizedOfferTable.advancedSearchForm
          .get('includeInactive')?.value;
    }

    const params = {
      communityCode: this.offerService.communityCode,
      ...filters,
      includeInactive: includeInactive ? true : false
    }

    return this.offerService.getUncategorizedOfferList(params);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    GarbageCollectorService.clearDetachedDOMElements(
      this,
      this.viewContainerRef
    )
  }
}
