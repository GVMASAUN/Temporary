import { Component, Input, OnInit } from '@angular/core';
import { DialogService } from '@visa/vds-angular';
import { of } from 'rxjs';
import { SearchTableComponent } from 'src/app/components/search-table/search-table.component';
import {
  SearchField,
  SearchFieldType,
  SearchTableColumn,
  SearchTableColumnType,
  SortDirection
} from 'src/app/components/search-table/search-table.model';
import { EMPTY } from 'src/app/core/constants';
import { HistoryDetailsComponent } from './history-details/history-details.component';
import { MatDialog } from '@angular/material/dialog';
import { EventGroupHistoryDesc, EventGroupHistoryType } from 'src/app/pages/programs/event-group.model';

@Component({
  selector: 'app-event-group-history',
  templateUrl: './event-group-history.component.html',
  styleUrls: ['./event-group-history.component.scss']
})
export class EventGroupHistoryComponent implements OnInit {
  @Input() parent: any;

  constructor(private dialog: MatDialog) { }

  tableColumns: SearchTableColumn[] = [
    {
      key: 'entityType',
      label: 'Entity Type',
      sortDirection: SortDirection.ASC
    },
    {
      key: 'entityName',
      label: 'Entity Name',
      type: SearchTableColumnType.LINK,
      click: (row: any, component: SearchTableComponent) => {

        this.dialog.open(
          HistoryDetailsComponent,
          {
            hasBackdrop: true, disableClose: true,
            data: { parent, row }
          });
      }
    },
    {
      key: 'actionType',
      label: 'Action Type'
    },
    {
      key: 'modifiedDate',
      label: 'Modified Date Time',
      type: SearchTableColumnType.DATE
    },
    {
      key: 'responsibleUser',
      label: 'Responsible User'
    }
  ];

  searchFields: SearchField[] = [
    {
      key: 'entityType',
      label: 'Entity Type',
      type: SearchFieldType.DROPDOWN,
      options: [
        {
          value: EMPTY,
          label: 'Any',
          disabled: true
        },
        {
          value: EventGroupHistoryType.Event_Group,
          label: EventGroupHistoryDesc.Event_Group
        },
        {
          value: EventGroupHistoryType.Event,
          label: EventGroupHistoryDesc.Event
        },
        {
          value: EventGroupHistoryType.Action,
          label: EventGroupHistoryDesc.Action
        }
      ]
    },
    {
      key: 'responsibleUser',
      label: 'Responsible User',
      type: SearchFieldType.DROPDOWN,
      options: [
        {
          value: EMPTY,
          label: 'Any'
        }
      ]
    },
    {
      key: 'actionType',
      label: 'Action Type',
      type: SearchFieldType.DROPDOWN,
      options: [
        {
          value: EMPTY,
          label: 'Any'
        },
        {
          value: 1,
          label: 'Create'
        },
        {
          value: 2,
          label: 'Update'
        },
        {
          value: 3,
          label: 'Delete'
        }
      ]
    },
    {
      key: 'actionStartDate',
      label: 'Action Start Date',
      type: SearchFieldType.DATE
    },
    {
      key: 'actionEndDate',
      label: 'Action End Date',
      type: SearchFieldType.DATE
    }
  ];

  ngOnInit(): void { }

  getHistoryList(filters: any = {}) {
    console.log(filters);
    const dummyData = of({
      data: [
        {
          entityType: 'Event',
          entityName: 'Auth MCC',
          actionType: 'Update',
          modifiedDate: '2023-04-02',
          responsibleUser: 'Atharva'
        }
      ]
    });
    return dummyData;
  }
}
