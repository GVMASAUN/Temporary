import { Component, Input, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import {
  ButtonIconType,
  ComboboxType
} from '@visa/vds-angular';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EMPTY } from 'src/app/core/constants';
import { Module } from 'src/app/core/models/module.model';
import { Option } from 'src/app/core/models/option.model';
import { PaginationResponse } from 'src/app/core/models/pagination-response.model';
import { StatusCode } from 'src/app/core/models/status.model';
import { ClientService } from 'src/app/services/client/client.service';
import { GarbageCollectorService } from 'src/app/services/garbage-collector.service';
import { NavStatusService } from 'src/app/services/nav-status/nav-status.service';
import { SearchTableComponent } from 'src/app/shared/search-table/search-table.component';
import { SearchField, SearchFieldType, SearchTableColumn, SearchTableColumnType, SortDirection } from 'src/app/shared/search-table/search-table.model';
import { Community } from '../clients.model';

@Component({
  selector: 'app-client-list',
  templateUrl: './client-list.component.html',
  styleUrls: ['./client-list.component.scss']
})
export class ClientListComponent implements OnInit, OnDestroy {
  @Input()
  viewType: 'page' | 'dialog' = 'page';

  private destroy$ = new Subject<void>();

  ComboBoxType = ComboboxType;
  ButtonIconType = ButtonIconType;

  fetchClients: boolean = false;
  isPanelOpen: boolean = false;
  menuOpen: boolean = false;
  timeoutCounter: any;
  selectedCommunity: string = EMPTY;
  selectedClientGroup: string = EMPTY;

  communityList: Community[] = [];

  clientGroupList: Community[] = [];

  tableColumns: SearchTableColumn[] = [
    {
      key: 'communityName',
      label: 'Client Name',
      sortDirection: SortDirection.ASC,
      type: SearchTableColumnType.LINK,
      fixed: true,
      click: (row: any, component: SearchTableComponent) => this.navigateToProgram(row.communityName)
    },
    {
      key: 'communityDescription',
      label: 'Description',
      sortable: false
    },
    {
      key: 'serviceStartDate',
      label: 'Effective',
      type: SearchTableColumnType.DATE
    },
    {
      key: 'isActive',
      label: 'Status',
      type: SearchTableColumnType.STATUS,
      mapValue: (row: any, component: SearchTableComponent) => {
        if (!row.isActive) {
          return StatusCode.INACTIVE;
        }
        return StatusCode.ACTIVE;
      }
    }
  ];

  advancedSearchFields: SearchField[] = [
    {
      key: 'clientCommunityName',
      label: 'Client Name'
    },
    {
      key: 'communityDescription',
      label: 'Client Description'
    },
    {
      key: 'isActive',
      label: 'Status',
      type: SearchFieldType.DROPDOWN,
      options: [
        new Option(EMPTY, 'Any'),
        new Option(true, 'Active'),
        new Option(false, 'Inactive')
      ]
    }
  ];

  constructor(
    private readonly _clientService: ClientService,
    private readonly _statusService: NavStatusService,
    private readonly _router: Router,
    private readonly _dialog: MatDialog,
    private readonly _viewContainerRef: ViewContainerRef
  ) { }

  ngOnInit(): void {
    this._statusService.getPanelStatus.pipe(takeUntil(this.destroy$))
      .subscribe({
        next: panelStatus => {
          this.isPanelOpen = panelStatus;
        }
      });

    this.getCommunityList();
  }

  private navigateToProgram(communityName: string): void {
    if (this.viewType === 'dialog') {
      this._router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
        this._router.navigate(
          [Module.PROGRAM.baseUrl],
          { queryParams: { client: communityName } }
        ));
    } else {
      this._router.navigate(
        [Module.PROGRAM.baseUrl],
        { queryParams: { client: communityName } }
      );
    }

    // Set the nav bar index to dashboard upon client selection
    this._statusService.setTabIndex(0);

    if (this.viewType === 'dialog') {
      this._dialog.closeAll();
    }
  }

  private getCommunityList(): void {
    const params = {
      ...(this.selectedCommunity && { communityName: this.selectedCommunity })
    };

    this._clientService.getCommunityList(params).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.communityList.length = 0;
          this.communityList.push(...res.data);
        },
        error: err => {
          console.log(err);
        }
      });
  }

  private getClientGroupList(): void {
    this.clientGroupList.length = 0;
    this.selectedClientGroup = '';

    const params = {
      parentCommunityCode: this.selectedCommunity
    };

    this._clientService.getClientGroupList(params).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.clientGroupList.push(...res.data);
        },
        error: err => {
          console.log(err);
        }
      });
  }

  protected getClientList(filters: any = {}): Observable<PaginationResponse<Community>> {
    const params = {
      parentCommunityCode: this.selectedClientGroup,
      ...filters
    };

    return this._clientService.getClientList(params);
  }

  protected selectOption(event: any, communityFlag: boolean): void {
    this.fetchClients = false;

    if (communityFlag) {
      this.selectedCommunity = event[0];
      this.getClientGroupList();
    } else {
      this.selectedClientGroup = event.target.value;

      if (this.selectedCommunity && this.selectedClientGroup) {
        this.fetchClients = true;
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    GarbageCollectorService.clearDetachedDOMElements
      (
        this,
        this._viewContainerRef
      );
  }
}
