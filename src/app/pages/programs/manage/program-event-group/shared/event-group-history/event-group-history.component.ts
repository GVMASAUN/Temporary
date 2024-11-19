import { AfterViewInit, Component, Input, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ButtonIconType, ComboboxType } from '@visa/vds-angular';
import { cloneDeep } from 'lodash';
import { Observable, Subject, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { ANY, COMMA_PATTERN, EMPTY, NEWLINE, SPACE, VisaIcon } from 'src/app/core/constants';
import { Option } from 'src/app/core/models/option.model';
import { PaginationResponse } from 'src/app/core/models/pagination-response.model';
import { ENTITY_DESC, EntityType, EventGroup, EventGroupHistory, EventGroupHistoryActionType } from 'src/app/pages/programs/event-group.model';
import { User } from 'src/app/pages/users/user.model';
import { NavStatusService } from 'src/app/services/nav-status/nav-status.service';
import { EventGroupHistoryService } from 'src/app/services/program/event-group/event-group-history.service';
import { Utils } from 'src/app/services/utils';
import { SearchTableComponent } from 'src/app/shared/search-table/search-table.component';
import {
  SearchField,
  SearchFieldType,
  SearchTableColumn,
  SearchTableColumnType,
} from 'src/app/shared/search-table/search-table.model';

@Component({
  selector: 'app-event-group-history',
  templateUrl: './event-group-history.component.html',
  styleUrls: ['./event-group-history.component.scss']
})
export class EventGroupHistoryComponent implements OnInit, AfterViewInit, OnDestroy {
  private destroy$ = new Subject<void>();

  @Input()
  eventGroup!: EventGroup;

  @ViewChild(SearchTableComponent)
  searchTableComponent!: SearchTableComponent;

  @ViewChild('entityField')
  entityTemplate!: TemplateRef<any>;


  entityMenuOpened: boolean = false;

  historyTableColumns: SearchTableColumn[] = [
    {
      key: 'entityType',
      label: 'Entity Type',
      fixed: true,
      sortable: false,
      mapValue: (row: EventGroupHistory) => ENTITY_DESC[row?.entityType]
    },
    {
      key: 'entityName',
      label: 'Entity Name',
      fixed: true,
      sortable: false
    },
    {
      key: 'actionType',
      label: 'Action Type',
      sortable: false
    },
    {
      key: 'historyMessages',
      label: 'Changes Made',
      sortable: false,
      cellStyle: () => {
        return 'white-space: pre-line;'
      },
      mapValue: (row) => {
        if (!!row.historyMessages) {
          return row.historyMessages.map((message: string) => message.replace(COMMA_PATTERN, EMPTY)).join(`${NEWLINE}${NEWLINE}`);
        }
      }
    },
    {
      key: 'modifiedUserFullName',
      label: 'Responsible User',
      sortable: false
    },
    {
      key: 'modifiedDate',
      label: 'Modified Date Time',
      type: SearchTableColumnType.DATE,
      sortable: false
    }
  ];

  searchFields: SearchField[] = [];


  EntityType = EntityType;
  ButtonIconType = ButtonIconType;
  VisaIcon = VisaIcon;

  constructor(
    private eventGroupHistoryService: EventGroupHistoryService,
    private navStatusService: NavStatusService
  ) { }

  private getHistoryUserList(): Observable<Array<Option>> {
    const params = {
      communityCode: this.eventGroup.communityCode,
      id: this.eventGroup.eventGroupId,
      workflowVersionNumber: this.eventGroup.workflowVersionNumber
    };

    return this.eventGroupHistoryService.getHistoryUsers(params)
      .pipe(
        map((paginationResponse: PaginationResponse<Array<User>>) => {
          const usersArray: User[] = paginationResponse.data || [];

          const optionsArray: Option[] = usersArray.map((user: User) => {
            const userFullName = user.firstName?.concat(SPACE, user.lastName!);

            return new Option(user.volId, userFullName!);
          });

          optionsArray.unshift(new Option(EMPTY, ANY));

          return optionsArray;
        }));
  }

  private setTableSearchFields() {
    this.searchFields = [
      {
        key: 'id',
        label: 'Entity',
        type: SearchFieldType.CUSTOM,
        templateRef: this.entityTemplate,
        disableReset: true
      },
      {
        key: 'modifiedUserId',
        label: 'Responsible User',
        type: SearchFieldType.DROPDOWN,
        options: this.getHistoryUserList()
      },
      {
        key: 'modificationStartDate',
        label: 'Action Start Date(MM/DD/YYYY)',
        type: SearchFieldType.DATE,
      },
      {
        key: 'modificationEndDate',
        label: 'Action End Date(MM/DD/YYYY)',
        type: SearchFieldType.DATE,
      }
    ];
  }

  private setDefaultValueToFilter() {

    this.searchTableComponent.advancedSearchForm.get("id")?.
      patchValue({
        label: this.eventGroup.eventGroupName,
        value: this.getEntityListItemValue(this.eventGroup.eventGroupId, EntityType.Event_Group)
      });
  }

  ngAfterViewInit(): void {
    this.setTableSearchFields();

    setTimeout(() => {
      if (this.searchTableComponent) {
        this.searchTableComponent.searchActivate = true;

        this.setDefaultValueToFilter();
      }
    }, 1000);
  }


  ngOnInit(): void { }


  getHistoryRecords(filters: any = {}): Observable<PaginationResponse<Array<EventGroupHistory>>> {
    let selectedEntity = cloneDeep(filters["id"]);

    if (Utils.isNotNull(selectedEntity)) {
      const selectedEntityFilter: any = JSON.parse(selectedEntity?.value);

      delete filters["id"];

      const params = {
        communityCode: this.eventGroup.communityCode,
        workflowVersionNumber: this.eventGroup.workflowVersionNumber,
        ...filters,
        ...selectedEntityFilter
      };

      return this.eventGroupHistoryService.getHistoryRecords(params);
    }

    return of(new PaginationResponse<EventGroupHistory[]>([]));
  }


  getEntityListItemValue(id: any, entityType: EntityType): string {
    return JSON.stringify({
      id: id,
      entityType: entityType
    });
  }

  handleFilterReset() {
    this.setDefaultValueToFilter();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    this.navStatusService.togglePanel(false);
  }
}
