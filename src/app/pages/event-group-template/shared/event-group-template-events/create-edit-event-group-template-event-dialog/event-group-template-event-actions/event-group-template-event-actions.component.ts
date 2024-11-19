import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ButtonColor } from '@visa/vds-angular';
import { SearchTableComponent } from 'src/app/shared/search-table/search-table.component';
import { SearchTableAction, SearchTableColumn, SearchTableColumnType, SortDirection } from 'src/app/shared/search-table/search-table.model';
import { EventGroupTemplate, EventTemplate } from 'src/app/pages/event-group-template/event-group-template.model';
import { EventAction, EventStep } from 'src/app/pages/programs/event.model';
import { AddEventActionComponent } from 'src/app/pages/programs/manage/program-event-group/create-edit-event/event-actions/add-event-action/add-event-action.component';
import { DialogMode } from 'src/app/pages/programs/program.model';
import { CustomFormGroup } from 'src/app/services/form-service/form.service';
import { EventActionService } from 'src/app/services/program/event-action/event-action.service';

@Component({
  selector: 'app-event-group-template-event-actions',
  templateUrl: './event-group-template-event-actions.component.html',
  styleUrls: ['./event-group-template-event-actions.component.scss']
})
export class EventGroupTemplateEventActionsComponent implements OnInit {
  @Input()
  form!: CustomFormGroup<EventTemplate>;

  @Input()
  disabled: boolean = false;

  @Input()
  dialogMode!: DialogMode;

  @Input()
  eventGroupTemplate!: EventGroupTemplate;


  ButtonColor = ButtonColor;


  get eventTemplate(): EventTemplate {
    return this.form.getRawValue() as EventTemplate;
  }

  constructor(
    private eventActionService: EventActionService,
    private dialog: MatDialog
  ) {
  }

  tableActions: SearchTableAction[] = [
    {
      label: 'Add action',
      buttonColor: this.ButtonColor.SECONDARY,
      click: () => this.openActionDialog(),
      disabled: () => this.dialogMode === DialogMode.CREATE
    }
  ];

  tableColumns: SearchTableColumn[] = [
    {
      key: 'eventActionName',
      label: 'Action Name',
      sortDirection: SortDirection.ASC,
      type: this.disabled ? SearchTableColumnType.DEFAULT : SearchTableColumnType.LINK,
      fixed: true,
      click: (row: any, component: SearchTableComponent) => {
        this.openActionDialog(this.disabled ? DialogMode.VIEW : DialogMode.EDIT, row);
      }
    },
    {
      key: 'eventActionType',
      label: 'Action Type',
      sortable: false
    }
  ];

  ngOnInit(): void { }

  openActionDialog(dialogMode = DialogMode.CREATE, actionDetail?: EventAction) {
    this.eventActionService.setEventActionDialogConfigData(
      dialogMode,
      actionDetail!,
      true,
      {
        event: this.form.getRawValue() as EventTemplate
      },
      // this.eventService.getEventDialogConfigData(),
      {
        eventGroup: this.eventGroupTemplate
      },
      EventStep.EVENT_ACTION
    )

    this.dialog.closeAll();


    this.dialog.open(
      AddEventActionComponent,
      {
        hasBackdrop: true, disableClose: true,
        width: '1250px',
        ariaLabel: 'add-action-dialog',
        data: {
          isOpenedFromEventTemplate: true
        }
      }
    );
  }

}
