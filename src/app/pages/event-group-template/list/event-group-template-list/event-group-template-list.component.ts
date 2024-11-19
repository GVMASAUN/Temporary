import { AfterViewInit, Component, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonColor } from '@visa/vds-angular';
import { Observable, Subject, Subscription } from 'rxjs';
import { SearchField, SearchFieldType, SearchTableAction, SearchTableColumn, SearchTableColumnType, SortDirection } from 'src/app/shared/search-table/search-table.model';
import { Option } from 'src/app/core/models/option.model';
import { PaginationResponse } from 'src/app/core/models/pagination-response.model';
import { StatusCode, StatusDesc } from 'src/app/core/models/status.model';
import { EventGroupTemplateService } from 'src/app/services/event-group-template.service';
import { NavStatusService } from 'src/app/services/nav-status/nav-status.service';
import { EventGroupTemplate } from '../../event-group-template.model';
import { takeUntil } from 'rxjs/operators';
import { GarbageCollectorService } from 'src/app/services/garbage-collector.service';

@Component({
  selector: 'app-event-group-template-list',
  templateUrl: './event-group-template-list.component.html',
  styleUrls: ['./event-group-template-list.component.scss']
})
export class EventGroupTemplateListComponent implements AfterViewInit, OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  isPanelOpen: boolean = false;

  tableColumns: SearchTableColumn[] = [];

  tableActions: SearchTableAction[] = [
    {
      label: 'CREATE EVENT GROUP TEMPLATE',
      buttonColor: ButtonColor.SECONDARY,
      click: () => {
        this.router.navigate(['event-group-template', 'create'], {
          queryParamsHandling: 'merge'
        });
      }
    }
  ];

  advancedSearchFields: SearchField[] = [
    {
      key: 'eventGroupName',
      label: 'Name'
    },
    {
      key: 'templateId',
      label: 'ID'
    },
    {
      key: 'statusCode',
      label: 'Status',
      type: SearchFieldType.DROPDOWN,
      options: [
        new Option(StatusCode.DRAFT, StatusDesc.DRAFT),
        new Option(StatusCode.PENDING_REVIEW, StatusDesc.PENDING_REVIEW),
        new Option(StatusCode.ACTIVE, StatusDesc.ACTIVE),
        new Option(StatusCode.REJECTED, StatusDesc.REJECT),
        new Option(StatusCode.INACTIVE, StatusDesc.INACTIVE)

      ]
    },
    {
      key: 'workflowType',
      label: 'Workflow Automation Type',
      type: SearchFieldType.DROPDOWN,
      options: this.eventGroupTemplateService.getAutomationTypes()
    }
  ];


  constructor(
    private router: Router,
    private navStatusService: NavStatusService,
    private eventGroupTemplateService: EventGroupTemplateService,
    private viewContainerRef: ViewContainerRef
  ) {
    this.tableColumns.push(...this.eventGroupTemplateService.getEventGroupTemplateTableColumns());
  }



  private registerOnChangeListeners() {
    this.navStatusService.getPanelStatus.pipe(takeUntil(this.destroy$))
      .subscribe({
        next: panelStatus => {
          this.isPanelOpen = panelStatus;
        }
      });
  }

  ngAfterViewInit(): void {
    this.registerOnChangeListeners();
  }

  ngOnInit(): void {

  }

  advancedSearch(
    filters: any = {}
  ): Observable<PaginationResponse<EventGroupTemplate[]>> {
    const params = {
      ...filters
    };

    return this.eventGroupTemplateService.advancedSearch(params);
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
