import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { ButtonColor, RadioChange } from '@visa/vds-angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PanelComponent } from 'src/app/shared/panel/panel.component';
import { PanelAction, PanelTab } from 'src/app/shared/panel/panel.model';
import { SearchTableComponent } from 'src/app/shared/search-table/search-table.component';
import {
  SearchTableAction,
  SearchTableColumn,
  SearchTableColumnType,
  SortDirection,
  SortType
} from 'src/app/shared/search-table/search-table.model';
import { EventGroup, EventGroupStep } from 'src/app/pages/programs/event-group.model';
import { Event } from 'src/app/pages/programs/event.model';
import {
  DialogMode,
  Program
} from 'src/app/pages/programs/program.model';
import { HttpService } from 'src/app/services/http/http.service';
import { NavStatusService } from 'src/app/services/nav-status/nav-status.service';
import { EventGroupService } from 'src/app/services/program/event-group/event-group.service';
import { EventService } from 'src/app/services/program/event/event.service';
import { CreateEditEventComponent } from '../../create-edit-event/create-edit-event.component';
import { ImportEventModalComponent } from '../../import-event-modal/import-event-modal.component';
import { EMPTY } from 'src/app/core/constants';
import { Utils } from 'src/app/services/utils';
import { HttpStatusCode } from '@angular/common/http';
import { ToggleAlertService } from 'src/app/services/toggle-alert/toggle-alert.service';

@Component({
  selector: 'app-event-group-events',
  templateUrl: './event-group-events.component.html',
  styleUrls: ['./event-group-events.component.scss']
})
export class EventGroupEventsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('panel')
  panel!: PanelComponent;

  @Input()
  eventGroupDetails!: EventGroup;

  @Input()
  form!: UntypedFormGroup;

  @Input()
  program!: Program;

  @Input()
  mode!: DialogMode;

  @Input()
  disabled: boolean = false;

  private destroy$ = new Subject<void>();

  ButtonColor = ButtonColor;
  SortType = SortType;

  selectedRowNumber: number = -1;
  isImportPanelOpen: boolean = false;

  tableId: string = 'reusable-element-list';
  caption: string = EMPTY;


  eventTableDataSource = [];
  panelTableData: any[] = [];

  tableColumns: SearchTableColumn[] = [
    {
      key: 'eventName',
      label: 'Event Name',
      type: SearchTableColumnType.LINK,
      fixed: true,
      sortDirection: SortDirection.ASC,
      click: (row: any) => this.openCreateEditEventDialog(
        this.disabled
          ?  DialogMode.VIEW
          : DialogMode.EDIT
        , row
      ),
    },
    {
      key: 'startDate',
      label: 'Start Date',
      type: SearchTableColumnType.DATE
    },
    {
      key: 'endDate',
      label: 'End Date',
      type: SearchTableColumnType.DATE
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
        this.openCreateEditEventDialog(DialogMode.CREATE, null),
      disabled: (component: SearchTableComponent) => {
        return this.mode === DialogMode.CREATE;
      }
    },
    {
      label: 'Import Events',
      buttonColor: ButtonColor.PRIMARY,
      click: (component: SearchTableComponent) => {
        this.openImportPanel();
      },
      disabled: (component: SearchTableComponent) => {
        return this.mode === DialogMode.CREATE;
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


  panelActions: PanelAction[] = [
    {
      label: 'IMPORT',
      buttonColor: ButtonColor.PRIMARY
    },
    {
      label: 'Cancel',
      buttonColor: ButtonColor.SECONDARY,
      click: () => {
        this.panel?.closePanel();
      }
    }
  ];

  panelTabs: PanelTab[] = [
    {
      label: 'Reusable Elements'
    }
  ];


  constructor(
    private navStatusService: NavStatusService,
    private route: ActivatedRoute,
    private http: HttpService,
    private eventService: EventService,
    private eventGroupService: EventGroupService,
    private alertService: ToggleAlertService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.registerOnChangeListeners();
    this.navStatusService.getPanelStatus
      .pipe(takeUntil(this.destroy$)).subscribe(response => {
        if (response === false) {
          this.isImportPanelOpen = response;
          this.selectedRowNumber = -1;
        }
      });

    if (this.mode !== DialogMode.VIEW) {
      this.getReusableEvents();
    }
  }

  ngAfterViewInit(): void {
    this.caption = Utils.generateCaptionMessage(this.tableColumns, this.tableId);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private registerOnChangeListeners() {
    this.form.get('eventStageList')?.valueChanges
      .pipe(takeUntil(this.destroy$)).subscribe(values => {
        const events = values || [];
        this.eventTableDataSource = events;
      });
  }

  private openCreateEditEventDialog(
    mode: DialogMode,
    eventDetails: Event | null
  ) {
    this.eventService.setEventDialogConfigData(
      mode,
      eventDetails!,
      true,
      this.eventGroupService.getEventGroupDialogConfigData(),
      EventGroupStep.EVENTS
    );

    this.dialog.closeAll();

    this.dialog.open(
      CreateEditEventComponent,
      {
        width: "1250px",
        hasBackdrop: true,
        disableClose: true,
        ariaLabel: 'create-edit-event-dialog'
      });
  }

  private openImportPanel() {
    this.navStatusService.togglePanel(true);
    this.isImportPanelOpen = true;
  }

  getReusableEvents() {
    this.eventService.getReusableEvents(this.route.snapshot.queryParams['client'])
      .subscribe(response => {
        if (Utils.isNull(response.errors) && (response.statusCode === HttpStatusCode.Ok)) {
          this.panelTableData = response.data;
        } else {
          this.alertService.showResponseErrors(response.errors);
        }
      });
  }

  onRowSelect(data: RadioChange, i: number) {
    if (data.value) {
      this.selectedRowNumber = this.panelTableData[i];
    }
  }
  importModal() {
    this.dialog.closeAll();

    this.dialog.open(
      ImportEventModalComponent, {
      hasBackdrop: true, disableClose: true,
      ariaLabel: 'import-event-dialog',
      data: {
        data: this.selectedRowNumber,
        type: 'event',
        parentDialogData: {
          mode: DialogMode.EDIT,
          eventGroupDialogMode: this.mode,
          eventGroup: this.form.getRawValue() as EventGroup,
          program: this.program
        },
        eventGroupDetails: this.eventGroupDetails,
        openParentDialog: true
      }
    });
    this.navStatusService.togglePanel(false);
  }

  closePanel() {
    this.navStatusService.togglePanel(false);
  }
}
