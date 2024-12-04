import { HttpStatusCode } from '@angular/common/http';
import {
  AfterViewInit,
  Component,
  Input,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import {
  ButtonColor,
  RadioChange,
  TooltipPosition
} from '@visa/vds-angular';
import { Observable, Subject, Subscription, merge } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EMPTY, VisaIcon } from 'src/app/core/constants';
import { Indicator } from 'src/app/core/models/indicator.model';
import { Mode } from 'src/app/core/models/mode.model';
import { PaginationResponse } from 'src/app/core/models/pagination-response.model';
import { StatusCode } from 'src/app/core/models/status.model';
import { EventGroupByTemplateDialogConfig, EventGroupTemplate } from 'src/app/pages/event-group-template/event-group-template.model';
import { HttpService } from 'src/app/services/http/http.service';
import { NavStatusService } from 'src/app/services/nav-status/nav-status.service';
import { EventGroupService } from 'src/app/services/program/event-group/event-group.service';
import { ProgramService } from 'src/app/services/program/program.service';
import { ToggleAlertService } from 'src/app/services/toggle-alert/toggle-alert.service';
import { Utils } from 'src/app/services/utils';
import { PanelComponent } from 'src/app/shared/panel/panel.component';
import { PanelAction, PanelTab } from 'src/app/shared/panel/panel.model';
import { SearchTableComponent } from 'src/app/shared/search-table/search-table.component';
import {
  SearchField,
  SearchFieldType,
  SearchTableAction,
  SearchTableColumn,
  SearchTableColumnType,
  SortDirection
} from 'src/app/shared/search-table/search-table.model';
import { EventGroup } from '../../event-group.model';
import { DialogMode, Program } from '../../program.model';
import { CreateEditEventGroupByTemplateComponent } from './create-edit-event-group-by-template/create-edit-event-group-by-template.component';
import { CreateEditEventGroupComponent } from './create-edit-event-group/create-edit-event-group.component';
import { EventGroupTemplateSelectorDialogComponent } from './event-group-tamplate-selector-dialog/event-group-template-selector-dialog.component';
import { ImportEventModalComponent } from './import-event-modal/import-event-modal.component';

@Component({
  selector: 'app-program-event-group',
  templateUrl: './program-event-group.component.html',
  styleUrls: ['./program-event-group.component.scss']

})
export class ProgramEventGroupComponent
  implements OnInit, AfterViewInit, OnDestroy {
  ButtonColor = ButtonColor;
  StatusCode = StatusCode
  VisaIcon = VisaIcon;
  TooltipPosition = TooltipPosition;

  @Input()
  mode!: Mode;

  @Input()
  form!: UntypedFormGroup;

  @ViewChild('panel')
  panel!: PanelComponent;

  @ViewChild('panelTable')
  panelTable!: SearchTableComponent;

  @ViewChild('eventGroupTable')
  eventGroupTable!: SearchTableComponent;

  @ViewChild('columnEventGroupName')
  columnEventGroupNameTemplate!: TemplateRef<any>;

  private destroy$ = new Subject<void>();

  tableId: string = 'resuable-elements-list';
  caption: string = EMPTY;

  subscriptions: Subscription[] = [];

  tableColumns: SearchTableColumn[] = [];

  tableActions: SearchTableAction[] = [
    {
      label: 'CREATE EVENT GROUP',
      buttonColor: ButtonColor.SECONDARY,
      click: () => this.openEventGroupDialog(DialogMode.CREATE, null)
    },
    {
      label: 'CREATE EVENT GROUP FROM TEMPLATE',
      buttonColor: ButtonColor.SECONDARY,
      click: () => this.openEventGroupTemplateSelectorDialog()
    },
    {
      label: 'Import Event Group',
      buttonColor: ButtonColor.PRIMARY,
      click: (component: SearchTableComponent) => {
        this.openPanel();
      }
    }
  ];

  advancedSearchFields: SearchField[] = [
    {
      key: 'eventGroupName',
      label: 'EventGroup Name',
      type: SearchFieldType.INPUT
    },
    {
      key: 'isPublished',
      label: 'Published Status',
      type: SearchFieldType.DROPDOWN,
      disableReset: true,
      options: [
        {
          value: Indicator.yes,
          label: 'Published'
        },
        {
          value: Indicator.no,
          label: 'Unpublished'
        }
      ]
    },
    {
      key: 'statusCode',
      label: 'Status',
      type: SearchFieldType.DROPDOWN,
      options: [],
      searchOptions: (queryString, params) => {
        params = {
          ...params,
          isPublished: queryString
        };
        return this.programService.getProgramStatusList(params);
      },
      searchDependencies: [
        {
          parentField: 'isPublished',
          isMandatory: true
        }
      ]
    },
    {
      key: 'startDate',
      label: 'Start Date(MM/DD/YYYY)',
      type: SearchFieldType.DATE
    },
    {
      key: 'endDate',
      label: 'End Date(MM/DD/YYYY)',
      type: SearchFieldType.DATE
    }
  ];

  panelTabs: PanelTab[] = [
    {
      label: 'Reusable Elements'
    }
  ];

  panelTableColumns: SearchTableColumn[] = [
    {
      key: 'eventGroupName',
      label: 'Event Group Name'
    }
  ];
  panelTableData: any[] = [];

  selectedRowNumber = -1;

  panelActions: PanelAction[] = [
    {
      label: 'IMPORT',
      buttonColor: ButtonColor.PRIMARY,
      disabled: () => {
        if (this.panelTable) {
          return !this.panelTable.selection.selected.length;
        }
        return true;
      }
    },
    {
      label: 'Cancel',
      buttonColor: ButtonColor.SECONDARY,
      click: () => {
        if (this.panel) {
          this.panel.closePanel();
        }
      }
    }
  ];

  isImportPanelOpen: boolean = false;

  originalTableColumns: SearchTableColumn[] = [];

  get isPublished(): boolean {
    return this.eventGroupTable?.advancedSearchForm?.controls?.["isPublished"]?.value === Indicator.yes;
  }

  get program(): Program {
    return this.form.getRawValue() as Program;
  }
  constructor(
    private navStatusService: NavStatusService,
    private programService: ProgramService,
    private eventGroupService: EventGroupService,
    private alertService: ToggleAlertService,
    private http: HttpService,
    private route: ActivatedRoute,
    private dialog: MatDialog
  ) { }

  ngAfterViewInit(): void {

    this.caption = Utils.generateCaptionMessage(this.tableColumns, this.tableId);

    this.initTableColumns();

    this.registerOnChangeListeners();

    if (this.eventGroupTable) {
      this.eventGroupTable.searchActivate = true;
      this.eventGroupTable.advancedSearchForm
        .get('isPublished')
        ?.patchValue(Indicator.yes);
    }

    this.getReusableEventGroups();
  }

  ngOnInit(): void {
    this.navStatusService.getPanelStatus
      .pipe(takeUntil(this.destroy$))
      .subscribe(response => {
        if (response === false) {
          this.isImportPanelOpen = response;
          this.selectedRowNumber = -1;
        }
      });

    merge(
      this.eventGroupService.reloadEventGroupObservable
    ).pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        if (!!res) {
          this.eventGroupTable.performSearch(0);
          this.getReusableEventGroups();
        }
      });
  }

  private openEventGroupTemplateSelectorDialog() {
    const templateEventGroupSelectorDialogRef = this.dialog.open(
      EventGroupTemplateSelectorDialogComponent,
      {
        data: {
          program: this.form.getRawValue() as Program
        },
        ariaLabel: 'event-group-template-selector-dialog',
        hasBackdrop: true, disableClose: true,
        width: "1250px"
      }
    );

    templateEventGroupSelectorDialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(response => {
        const selectedItem: EventGroupTemplate = response?.selectedTemplate;

        const config: EventGroupByTemplateDialogConfig = {
          dialogMode: DialogMode.CREATE,
          eventGroupId: selectedItem.eventGroupId!,
          eventGroupTemplateId: selectedItem.eventGroupTemplateId,
          programStageId: this.program?.programStageId!
        }

        this.dialog.open(
          CreateEditEventGroupByTemplateComponent,
          {
            hasBackdrop: true,
            disableClose: true,
            width: '1250px',
            ariaLabel: 'create-edit-template-dialog',
            data: config
          }
        );
      });
  }


  private openEventGroupDialog(
    mode: DialogMode,
    eventGroup: EventGroup | null,
    isDraftAvailable: boolean = false
  ) {
    if (!!eventGroup?.eventGroupTemplateId && mode !== DialogMode.CREATE) {
      this.eventGroupService.openEventGroupByTemplateDialog(
        {
          dialogMode: DialogMode.EDIT,
          eventGroupId: eventGroup.eventGroupId!,
          eventGroupTemplateId: eventGroup.eventGroupTemplateId,
          programStageId: this.program.programStageId!,
          isPublished: this.isPublished && !isDraftAvailable
        }
      );
    } else {
      this.eventGroupService.setEventGroupDialogConfigData(
        mode,
        eventGroup!,
        this.form.getRawValue() as Program,
        null,
        isDraftAvailable || !this.isPublished
      );

      this.dialog.open(
        CreateEditEventGroupComponent,
        {
          data: { summaryMode: true },
          hasBackdrop: true,
          disableClose: true,
          width: '1250px',
          ariaLabel: 'create-edit-event-group'
        }
      );
    }
  }

  private registerOnChangeListeners() {
    if (this.eventGroupTable) {
      const publishFilterSubscription = this.eventGroupTable.advancedSearchForm
        .get('isPublished')
        ?.valueChanges
        .pipe(takeUntil(this.destroy$))
        .subscribe(value => {
          const columns = [];

          columns.push(...this.originalTableColumns);

          if (value === Indicator.yes) {
            columns.splice(
              1,
              0,
              ...[
                {
                  key: 'vopOfferId',
                  label: 'VOP ID',
                  sortable: false
                },
                {
                  key: 'eventGroupStatusCode',
                  label: 'Publish Status',
                  type: SearchTableColumnType.STATUS
                },
                {
                  key: 'hasDraft',
                  label: 'Has Draft',
                  type: SearchTableColumnType.ICON,
                  sortable: false,
                  icon:  (row: any, component: SearchTableComponent) => { return VisaIcon.EDIT },
                  click: (row: any, component: SearchTableComponent) => this.openEventGroupDialog(DialogMode.EDIT, row, true)
                }
              ]
            );
          } else {
            columns.splice(
              1,
              0,
              ...[
                {
                  key: 'eventGroupStatusCode',
                  label: 'Status',
                  type: SearchTableColumnType.STATUS
                },
                {
                  key: 'workflowVersionNumber',
                  label: 'Version',
                  type: SearchTableColumnType.DEFAULT,
                  sortable: false
                }
              ]
            );
          }

          this.tableColumns = columns;
        });

      if (publishFilterSubscription) {
        this.subscriptions.push(publishFilterSubscription);
      }
    }
  }

  private openPanel() {
    this.navStatusService.togglePanel(false);

    this.isImportPanelOpen = true;

    this.navStatusService.togglePanel(true);

  }

  private initTableColumns() {
    this.tableColumns = [
      {
        key: 'eventGroupName',
        label: 'Event Group Name',
        sortDirection: SortDirection.ASC,
        type: SearchTableColumnType.TEMPLATE,
        columnTemplateRef: this.columnEventGroupNameTemplate,
        fixed: true,
        cellStyle: () => {
          return 'display: flex; align-items: center; justify-content: flex-start;'
        },
        click: (row: EventGroup, component: SearchTableComponent) =>
          this.openEventGroupDialog(DialogMode.EDIT, row)
      },
      {
        key: 'eventGroupTemplateId',
        label: 'Type',
        sortable: false,
        mapValue(row, table) {
          if (row.eventGroupTemplateId) {
            return "Templated"
          } else {
            return "Non-Templated"
          }
        }
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
      }
    ];

    this.originalTableColumns = this.tableColumns.map(c =>
      Object.assign({}, c)
    );
  }

  getEventGroups(filters: any = {}): Observable<PaginationResponse<EventGroup[]>> | null {
    const params = {
      communityCode: this.programService.communityCode,
      programStageId: this.program.programStageId,
      ...filters
    };

    if (filters?.isPublished === Indicator.yes) {
      return this.eventGroupService.getPublishedEventGroups(params);
    } else if (filters?.isPublished === Indicator.no) {
      return this.eventGroupService.getEventGroups(params);
    }

    return null;

  }

  getReusableEventGroups() {
    this.eventGroupService.getReusableEventGroups(this.route.snapshot.queryParams['client'])
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

  closePanel() {
    this.navStatusService.togglePanel(false);
  }

  importModal() {

    this.dialog.open(
      ImportEventModalComponent,
      {
        hasBackdrop: true,
        disableClose: true,
        width: '540px',
        ariaLabel: 'event-import-dialog',
        data: {
          data: this.selectedRowNumber,
          type: 'event-group',
          parentDialogData: {
            eventGroupDialogMode: DialogMode.EDIT,
            program: this.program
          },
          openParentDialog: true
        }
      }
    );

    this.closePanel();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
