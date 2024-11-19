import { Component, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { ButtonColor, TabsOrientation } from '@visa/vds-angular';
import {
  ExploreTemplate,
  ExploreTemplateStep
} from '../explore-template.model';
import { NavStatusService } from 'src/app/services/nav-status/nav-status.service';
import { SearchTableComponent } from 'src/app/components/search-table/search-table.component';
import { Observable, Subject } from 'rxjs';
import {
  SearchField,
  SearchTableAction,
  SearchTableColumn,
  SearchTableColumnType,
  SortDirection
} from 'src/app/components/search-table/search-table.model';
import { ExploreTemplateService } from 'src/app/services/explore-template/explore-template.service';
import { PaginationResponse } from 'src/app/core/models/pagination-response.model';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { GarbageCollectorService } from 'src/app/services/garbage-collector.service';
import { FunctionsService } from 'src/app/services/util/functions.service';

@Component({
  selector: 'app-explore-templates-list',
  templateUrl: './explore-templates-list.component.html',
  styleUrls: ['./explore-templates-list.component.scss']
})
export class ExploreTemplatesListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  tableColumns: SearchTableColumn[] = [
    {
      key: 'messageName',
      label: 'Template Name',
      sortDirection: SortDirection.ASC,
      type: SearchTableColumnType.LINK,
      fixed: true,
      click: (row: any, component: SearchTableComponent) => {
        localStorage.setItem('selectedEPM', JSON.stringify(row));

        this.router.navigate(['explore-template', 'manage', row.messageId], {
          queryParamsHandling: 'merge'
        });
      }
    },
    {
      key: 'communityCode',
      label: 'Community Code'
    },
    {
      key: 'messageId',
      label: 'Message Id'
    },
    {
      key: 'modifiedDate',
      label: 'Modification Date Time',
      type: SearchTableColumnType.DATE
    }
  ];

  tableActions: SearchTableAction[] = [
    {
      label: 'CREATE EPM TEMPLATE',
      buttonColor: ButtonColor.SECONDARY,
      click: () => this.router.navigate(['explore-template', 'create'], {
        queryParamsHandling: 'merge'
      })
    }
  ];

  advancedSearchFields: SearchField[] = [
    {
      key: 'messageName',
      label: 'Template Name'
    },
    {
      key: 'messageId',
      label: 'Message Id'
    }
  ];

  tabs: string[] = [ExploreTemplateStep.ENDPOINT_MESSAGES];

  TabsOrientation = TabsOrientation;

  selectedTabIndex: number = 0;
  isPanelOpen: boolean = false;

  readonly viewName = "explore-templates-list";

  getTabId: Function = this.functionService.getTabId;
  getTabLabelledById: Function = this.functionService.getTabLabelledById;


  constructor(
    private router: Router,
    private navStatusService: NavStatusService,
    private templateService: ExploreTemplateService,
    private viewContainerRef: ViewContainerRef,
    private functionService: FunctionsService
  ) { }

  ngAfterViewInit(): void {
    this.registerOnChangeListeners();
  }

  ngOnInit(): void {
    this.setCurrentTab();
  }

  getTemplateList(
    filters: any = {}
  ): Observable<PaginationResponse<ExploreTemplate>> {
    const params = {
      communityCode: this.templateService.communityCode,
      ...filters
    };

    return this.templateService.getTemplateList(params);
  }

  private setCurrentTab() {
    this.selectedTabIndex = this.tabs.indexOf(
      ExploreTemplateStep.ENDPOINT_MESSAGES
    );
  }

  private registerOnChangeListeners() {
    this.navStatusService.getPanelStatus.pipe(takeUntil(this.destroy$))
      .subscribe({
        next: panelStatus => {
          this.isPanelOpen = panelStatus;
        }
      });
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
