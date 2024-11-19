import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ButtonColor, DialogService } from '@visa/vds-angular';
import { Subject, Subscription } from 'rxjs';
import { SearchTableComponent } from 'src/app/shared/search-table/search-table.component';
import { SearchTableAction, SearchTableColumn, SearchTableColumnType, SortDirection, SortType } from 'src/app/shared/search-table/search-table.model';
import { Mode } from 'src/app/core/models/mode.model';
import { EventGroupStep } from 'src/app/pages/programs/event-group.model';
import { Event } from 'src/app/pages/programs/event.model';
import { DialogMode } from 'src/app/pages/programs/program.model';
import { NavStatusService } from 'src/app/services/nav-status/nav-status.service';
import { EventService } from 'src/app/services/program/event/event.service';
import { CreateEditEventGroupTemplateEventDialogComponent } from './create-edit-event-group-template-event-dialog/create-edit-event-group-template-event-dialog.component';
import { EventGroupTemplate, EventTemplate } from '../../event-group-template.model';
import { CustomFormGroup } from 'src/app/services/form-service/form.service';
import { takeUntil } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-event-group-template-events',
  templateUrl: './event-group-template-events.component.html',
  styleUrls: ['./event-group-template-events.component.scss']
})
export class EventGroupTemplateEventsComponent implements OnInit, OnDestroy {
  @Input()
  eventGroupDetails!: EventGroupTemplate;

  @Input()
  form!: CustomFormGroup<EventGroupTemplate>;

  @Input()
  mode: Mode = Mode.Create;;

  @Input()
  editable: boolean = false;

  private destroy$ = new Subject<void>();

  ButtonColor = ButtonColor;
  SortType = SortType;

  selectedRowNumber: number = -1;
  isImportPanelOpen: boolean = false;


  eventTableDataSource = [];
  panelTableData: any[] = [];
  subscription: Subscription[] = [];

  tableColumns: SearchTableColumn[] = [
    {
      key: 'eventName',
      label: 'Event Name',
      type: SearchTableColumnType.LINK,
      fixed: true,
      sortDirection: SortDirection.ASC,
      click: (row: EventTemplate) => this.openCreateEditEventTemplateDialog(
        DialogMode.EDIT,
        row
      )
    },
    {
      key: 'eventStatus',
      label: 'Status',
      type: SearchTableColumnType.STATUS
    }
  ];

  tableActions: SearchTableAction[] = [
    {
      label: 'CREATE EVENT',
      buttonColor: ButtonColor.SECONDARY,
      click: (component: SearchTableComponent) =>
        this.openCreateEditEventTemplateDialog(DialogMode.CREATE, null),
      disabled: (component: SearchTableComponent) => {
        return this.mode === Mode.Create || !this.editable;
      }
    }
  ];

  panelTableColumns: SearchTableColumn[] = [
    {
      key: 'eventGroupName',
      label: 'Event Name'
    },
    {
      key: 'eventType',
      label: 'Event Type'
    },
    {
      key: 'eventDescription',
      label: 'Event Description'
    }
  ];


  constructor(
    private navStatusService: NavStatusService,
    private eventService: EventService,
    private dialog: MatDialog
  ) { }


  private registerOnChangeListeners() {
    this.form.controls.eventTemplateList?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(values => {
        const events = values || [];
        this.eventTableDataSource = events;
      });
  }

  private openCreateEditEventTemplateDialog(
    mode: DialogMode,
    eventDetails: Event | null
  ) {
    this.eventService.setEventDialogConfigData(
      this.editable ? mode : DialogMode.VIEW,
      eventDetails!,
      false,
      {
        eventGroupTemplate: this.form.getRawValue()
      },
      EventGroupStep.EVENTS
    );


    this.dialog.open(
      CreateEditEventGroupTemplateEventDialogComponent,
      {
        hasBackdrop: true, disableClose: true,
        width: '1250px',
        ariaLabel: 'create-edit-template-dialog'
      }
    );
  }

  ngOnInit(): void {
    this.registerOnChangeListeners();
    this.navStatusService.getPanelStatus.pipe(takeUntil(this.destroy$))
      .subscribe(response => {
        if (response === false) {
          this.isImportPanelOpen = response;
          this.selectedRowNumber = -1;
        }
      });
  }

  closePanel() {
    this.navStatusService.togglePanel(false);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
