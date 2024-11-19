import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ButtonColor } from '@visa/vds-angular';
import { SearchTableComponent } from 'src/app/shared/search-table/search-table.component';
import {
  SearchTableAction,
  SearchTableColumn,
  SearchTableColumnType,
  SortDirection,
  SortType
} from 'src/app/shared/search-table/search-table.model';
import { EventAction, EventStep } from 'src/app/pages/programs/event.model';
import { DialogMode } from 'src/app/pages/programs/program.model';
import { EventActionService } from 'src/app/services/program/event-action/event-action.service';
import { EventGroupService } from 'src/app/services/program/event-group/event-group.service';
import { EventService } from 'src/app/services/program/event/event.service';
import { AddEventActionComponent } from './add-event-action/add-event-action.component';

@Component({
  selector: 'app-event-actions',
  templateUrl: './event-actions.component.html',
  styleUrls: ['./event-actions.component.scss']
})
export class EventActionsComponent implements OnInit {
  @Input() parent: any;
  @Input() actions: EventAction[] = [];
  @Input() disabled: boolean = false;
  @Input() isTemplateEvent: boolean = false;
  @Input()
  dialogMode!: DialogMode;

  buttonColor = ButtonColor;
  SortType = SortType;

  constructor(
    private eventActionService: EventActionService,
    private eventService: EventService,
    private eventGroupService: EventGroupService,
    private dialog: MatDialog,
  ) { }

  tableActions: SearchTableAction[] = [
    {
      label: 'Add action',
      buttonColor: this.buttonColor.SECONDARY,
      click: () => this.openEvent(),
      disabled: () => this.dialogMode === DialogMode.CREATE
    }
  ];

  tableColumns: SearchTableColumn[] = [
    {
      key: 'actionName',
      label: 'Action Name',
      sortDirection: SortDirection.ASC,
      type: this.disabled ? SearchTableColumnType.DEFAULT : SearchTableColumnType.LINK,
      fixed: true,
      click: (row: any, component: SearchTableComponent) => {
        this.openEvent(this.disabled ? DialogMode.VIEW : DialogMode.EDIT, row);
      }
    },
    {
      key: 'eventActionType',
      label: 'Action Type',
      sortable: false
    }
  ];

  ngOnInit(): void { }

  openEvent(dialogMode = DialogMode.CREATE, actionDetail?: EventAction) {
    this.eventActionService.setEventActionDialogConfigData(
      dialogMode,
      actionDetail!,
      true,
      this.eventService.getEventDialogConfigData(),
      this.eventGroupService.getEventGroupDialogConfigData(),
      EventStep.EVENT_ACTION
    )

    this.dialog.closeAll();

    this.dialog.open(
      AddEventActionComponent,
      {
        hasBackdrop: true,
        disableClose: true,
        width: '1250px',
        ariaLabel: 'add-action-dialog'
      }
    );
  }
}
