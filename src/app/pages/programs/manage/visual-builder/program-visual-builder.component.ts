import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ButtonColor } from '@visa/vds-angular';
import { Observable, Subject, merge } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SUCCESS_CODE } from 'src/app/core/constants';
import { DialogComponent } from 'src/app/core/dialog/dialog.component';
import { ButtonDirection } from 'src/app/core/models/dialog-button-direction.model';
import { Mode } from 'src/app/core/models/mode.model';
import { Option } from 'src/app/core/models/option.model';
import { PaginationResponse } from 'src/app/core/models/pagination-response.model';
import { StatusCode } from 'src/app/core/models/status.model';
import { EventGroupByTemplateDialogConfig, EventGroupTemplate } from 'src/app/pages/event-group-template/event-group-template.model';
import { NavStatusService } from 'src/app/services/nav-status/nav-status.service';
import { EventActionService } from 'src/app/services/program/event-action/event-action.service';
import { EventGroupService } from 'src/app/services/program/event-group/event-group.service';
import { EventService } from 'src/app/services/program/event/event.service';
import { ProgramService } from 'src/app/services/program/program.service';
import { ToggleAlertService } from 'src/app/services/toggle-alert/toggle-alert.service';
import { Utils } from 'src/app/services/utils';
import { PanelComponent } from 'src/app/shared/panel/panel.component';
import { PanelAction, PanelTab } from 'src/app/shared/panel/panel.model';
import { SearchTableComponent } from 'src/app/shared/search-table/search-table.component';
import { SearchTableColumn } from 'src/app/shared/search-table/search-table.model';
import { EventGroup, EventGroupType } from '../../event-group.model';
import { DialogMode, Program } from '../../program.model';
import { CreateEditEventGroupByTemplateComponent } from '../program-event-group/create-edit-event-group-by-template/create-edit-event-group-by-template.component';
import { CreateEditEventGroupComponent } from '../program-event-group/create-edit-event-group/create-edit-event-group.component';
import { CreateEditEventComponent } from '../program-event-group/create-edit-event/create-edit-event.component';
import { AddEventActionComponent } from '../program-event-group/create-edit-event/event-actions/add-event-action/add-event-action.component';
import { EventGroupTemplateSelectorDialogComponent } from '../program-event-group/event-group-tamplate-selector-dialog/event-group-template-selector-dialog.component';
import { ImportEventModalComponent } from '../program-event-group/import-event-modal/import-event-modal.component';
import { ProgramBuilderGraphComponent } from './program-builder-graph/program-builder-graph.component';
import { PROGRAM_BUILDER_LEVEL_DESC, ProgramBuilderLevel, ProgramBuilderNodeType, ProgramVisualBuilderNode, ProgramVisualBuilderNodeDTO, ProgramVisualBuilderNodeSelection } from './program-builder-graph/program-builder-graph.model';

@Component({
  selector: 'app-program-visual-builder',
  templateUrl: './program-visual-builder.component.html',
  styleUrls: ['./program-visual-builder.component.scss']
})
export class ProgramVisualBuilderComponent implements OnInit, OnDestroy {
  @Input()
  mode!: Mode;

  @Input()
  form!: UntypedFormGroup;

  @ViewChild("graphComponent")
  graphComponent!: ProgramBuilderGraphComponent;

  @ViewChild('importPanel')
  importPanel!: PanelComponent;

  @ViewChild('importPanelTable')
  importPanelTable!: SearchTableComponent;

  private destroy$ = new Subject<void>();

  readonly ButtonColor = ButtonColor;
  readonly defaultView = 0.75;

  EventGroupType = EventGroupType;


  viewOptions: Option[] = [
    {
      label: "100%",
      value: 1
    },
    {
      label: "75%",
      value: 0.75
    },
    {
      label: "50%",
      value: 0.50
    },
    {
      label: "25%",
      value: 0.25
    }
  ];

  importPanelActions: PanelAction[] = [
    {
      label: 'IMPORT',
      buttonColor: ButtonColor.PRIMARY,
      click: () => {
        this.openImportModal(this.importPanelTable?.selection.selected[0]);
      },
      disabled: () => !this.importPanelTable?.selection?.selected?.length
    },
    {
      label: 'Cancel',
      buttonColor: ButtonColor.SECONDARY,
      click: () => {
        this.closeImportPanel()
      }
    }
  ]

  panelExpended: boolean = false;
  isImportPanelOpen: boolean = false;

  selectedEventGroupType: EventGroupType = EventGroupType.UNPUBLISHED;

  programSummary!: Program | null;

  private currentNodeSelection!: ProgramVisualBuilderNodeSelection;

  get program(): Program {
    return this.form.getRawValue() as Program;
  }

  get selectedNodeLevel(): ProgramBuilderLevel {
    return this.currentNodeSelection?.currentNode?.data?.nodeLevel!;
  }

  get isPublishedTypeSelected(): boolean {
    return this.selectedEventGroupType === EventGroupType.PUBLISHED;
  }

  constructor(
    private eventService: EventService,
    private eventActionService: EventActionService,
    private eventGroupService: EventGroupService,
    private navStatusService: NavStatusService,
    private toggleAlertService: ToggleAlertService,
    private programService: ProgramService,
    private dialog: MatDialog
  ) {
    merge(
      this.eventGroupService.reloadEventGroupObservable,
      this.eventService.reloadEventObservable,
      this.eventActionService.reloadEventActionObservable
    ).pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        if (!!res) {
          this.ngOnInit();
        }
      });
  }

  ngOnInit(): void {
    this.setProgram(this.selectedEventGroupType);

    this.navStatusService.getPanelStatus
      .pipe(takeUntil(this.destroy$))
      .subscribe(response => {
        if (response === false) {
          this.isImportPanelOpen = false;
        }
      });
  }

  private setProgram(eventGroupType: EventGroupType) {
    const entity = this.form.getRawValue() as Program;

    const isPublished: boolean = eventGroupType === EventGroupType.PUBLISHED;

    this.programSummary = null;

    this.programService.getProgramSummary(entity.programStageId!, isPublished)
      .subscribe(
        {
          next: response => {
            if ((response.statusCode === SUCCESS_CODE) && Utils.isNull(response.errors)) {
              this.programSummary = response.data;
            } else {
              this.toggleAlertService.showResponseErrors(response.errors);
            }
          },
          error: err => console.log(err)
        }
      );
  }

  zoom(item: any) {
    this.graphComponent.zoomLevel = item.value;
  }

  onNodeClick(programVisualBuilderNodeSelection: ProgramVisualBuilderNodeSelection) {
    this.currentNodeSelection = programVisualBuilderNodeSelection;

    const programVisualBuilderNode: ProgramVisualBuilderNode = programVisualBuilderNodeSelection.currentNode;


    if (programVisualBuilderNode && this.validateNode(programVisualBuilderNode)) {
      const nodeData: ProgramVisualBuilderNodeDTO = programVisualBuilderNode.data;
      const level: ProgramBuilderLevel | undefined = nodeData.nodeLevel;

      if (
        nodeData &&
        (nodeData.nodeType === ProgramBuilderNodeType.LEAF) ||
        (nodeData.nodeType === ProgramBuilderNodeType.CHILD && Utils.isNull(nodeData?.nodeEntityData))
      ) {
        this.dialog.open(
          DialogComponent,
          {
            hasBackdrop: true, disableClose: true,
            ariaLabel: 'selection-dialog',
            data: {
              title: 'Please choose an option.',
              buttonDirection: ButtonDirection.RIGHT,
              buttons: [
                {
                  label: `Create ${PROGRAM_BUILDER_LEVEL_DESC[level!]}`,
                  color: ButtonColor.PRIMARY,
                  click: () => {

                    this.openDialog(
                      DialogMode.CREATE,
                      programVisualBuilderNode, programVisualBuilderNodeSelection.parentNode,
                      programVisualBuilderNodeSelection.eventGroupNode
                    )
                  },
                },
                ...(
                  [ProgramBuilderLevel.EVENT_GROUP].includes(level!)
                    ? [
                      {
                        label: `Create ${PROGRAM_BUILDER_LEVEL_DESC[level!]} from Template`,
                        color: ButtonColor.SECONDARY,
                        click: () => {
                          this.dialog.closeAll();

                          this.dialog.open(
                            EventGroupTemplateSelectorDialogComponent,
                            {
                              width: "1250px",
                              height: "700px",
                              hasBackdrop: true,
                              disableClose: true,
                              ariaLabel: 'event-group-template-select-dialog',
                              data: {
                                program: this.form.getRawValue() as Program
                              }
                            }).afterClosed()
                            .pipe(takeUntil(this.destroy$))
                            .subscribe(response => {
                              const selectedItem: EventGroupTemplate = response?.selectedTemplate;

                              const config: EventGroupByTemplateDialogConfig = {
                                dialogMode: DialogMode.CREATE,
                                eventGroupId: selectedItem.eventGroupId!,
                                eventGroupTemplateId: selectedItem.eventGroupTemplateId,
                                programStageId: this.program?.programStageId!
                              }

                              const dialogRef = this.dialog.open(
                                CreateEditEventGroupByTemplateComponent,
                                {
                                  hasBackdrop: true,
                                  width: '1250px',
                                  disableClose: true,
                                  data: config,
                                  ariaLabel: 'create-edit-template-dialog'
                                }
                              );
                            });
                        }
                      }
                    ]
                    : []
                ),
              ]
            }
          }
        );
      }

      if (Utils.isNotNull(programVisualBuilderNode?.data?.nodeEntityData)) {
        this.openDialog(
          DialogMode.EDIT,
          programVisualBuilderNode,
          programVisualBuilderNodeSelection.parentNode,
          programVisualBuilderNodeSelection.eventGroupNode
        );
      }
    }
  }

  handleEventGroupChange(event: any) {
    if (event) {
      this.selectedEventGroupType = event.target.value;
    }

    this.setProgram(this.selectedEventGroupType);

  }

  private validateNode(node: ProgramVisualBuilderNode): boolean {
    let valid = false;

    if (this.graphComponent) {
      const edges = this.graphComponent.links;
      const nodes = this.graphComponent.nodes;

      if (Utils.isNotNull(edges)) {
        const sourceNodeId = edges.find(edge =>
          edge.target === node.id
        )?.source;

        if (sourceNodeId) {
          valid = nodes.some((node: ProgramVisualBuilderNode) => node.id === sourceNodeId && (
            node.data.nodeType === ProgramBuilderNodeType.ROOT || Utils.isNotNull(node?.data?.nodeEntityData)
          ));
        }
      }
    }

    return valid;
  }

  // private closeSidePanel() {
  //   this.panelExpended = false;
  //   this.sidePanelComponent.panelExpended = false;
  //   this.sidePanelComponent.data = null;
  // }

  // private openSidePanel(node: ProgramVisualBuilderNode) {
  //   this.panelExpended = true;

  //   const nodeLevel: ProgramBuilderLevel | undefined = node?.data?.nodeLevel;
  //   this.sidePanelComponent.panelExpended = this.panelExpended;

  //   const programVisualBuilderNodeDTO: ProgramVisualBuilderNodeDTO = node.data;

  //   this.sidePanelComponent.data = programVisualBuilderNodeDTO.nodeEntityData;

  //   if (nodeLevel) {
  //     this.sidePanelComponent.fields = this.getPanelFields(nodeLevel);
  //     this.sidePanelComponent.panelTitle = PROGRAM_BUILDER_LEVEL_DESC[nodeLevel];
  //     this.sidePanelComponent.panelTitleIcon = PROGRAM_BUILDER_LEVEL_ICON[nodeLevel];
  //   }

  //   this.sidePanelComponent.name = programVisualBuilderNodeDTO.name || EMPTY;
  // }


  // private getPanelFields(nodeLevel: ProgramBuilderLevel | undefined): Field[] {
  //   if (nodeLevel === ProgramBuilderLevel.EVENT_GROUP) {
  //     return [
  //       new Field('eventGroupName', 'Event Group Name'),
  //       new Field('eventGroupType', 'Group Type'),
  //       new Field('eventGroupDescription', 'Group Description', 'textArea'),
  //       new Field('startDate', 'Start Date', 'date'),
  //       new Field('endDate', 'End Date', 'date')
  //     ];
  //   }

  //   if (nodeLevel === ProgramBuilderLevel.EVENTS) {
  //     return [
  //       new Field('eventName', 'Event Name'),
  //       new Field('eventType', 'Event Type'),
  //       new Field('eventDescription', 'Event Description', 'textArea'),
  //       new Field('eventStartDate', 'Start Date', 'date'),
  //       new Field('eventEndDate', 'End Date', 'date')
  //     ];
  //   }

  //   if (nodeLevel === ProgramBuilderLevel.ACTIONS) {
  //     return [
  //       new Field('endpointMessageName', 'Endpoint Message'),
  //       new Field('endpointUrlName', 'Endpoint URL'),
  //       new Field('epmSystemDefinedFields', 'Required Fields', 'textArea')
  //     ];
  //   }

  //   return [];
  // }

  private openTemplatedEventGroupDialog(programStageId: number, eventGroup: EventGroup, viewId: string | undefined) {
    this.eventGroupService.openEventGroupByTemplateDialog(
      {
        dialogMode: DialogMode.EDIT,
        eventGroupId: eventGroup.eventGroupId!,
        eventGroupTemplateId: eventGroup?.eventGroupTemplateId,
        programStageId: programStageId!,
        isPublished: this.isPublishedTypeSelected,
        viewId: viewId
      }
    );
  }

  private openNonTemplatedEventGroup(
    dialogMode: DialogMode,
    entityData: any,
    program: Program,
    scrollViewId?: string
  ) {
    this.eventGroupService.setEventGroupDialogConfigData(
      dialogMode,
      entityData,
      program,
      null,
      !this.isPublishedTypeSelected
    );

    this.dialog.open(
      CreateEditEventGroupComponent,
      {
        hasBackdrop: true,
        disableClose: true,
        width: '1250px',
        ariaLabel: 'create-edit-event-group-dialog',
        data: {
          summaryMode: true,
          scrollViewId: scrollViewId
        }
      }
    );
  }

  private openDialog(
    dialogMode: DialogMode,
    currentNode: ProgramVisualBuilderNode,
    parentNode: ProgramVisualBuilderNode,
    grandParentNode: ProgramVisualBuilderNode | null
  ) {
    const data: ProgramVisualBuilderNodeDTO = currentNode.data;
    const level: ProgramBuilderLevel = data.nodeLevel!;
    const entityData = currentNode?.data?.nodeEntityData;
    const parentEntityData = parentNode?.data?.nodeEntityData;

    this.dialog.closeAll();

    const program: Program = this.form.getRawValue() as Program;
    const programStageId: number = program.programStageId!;

    if (level === ProgramBuilderLevel.EVENT_GROUP) {
      const isTemplateEventGroup = !!entityData?.eventGroupTemplateId;

      if (isTemplateEventGroup) {
        this.openTemplatedEventGroupDialog(
          programStageId,
          entityData,
          undefined
        );
      } else {
        this.openNonTemplatedEventGroup(dialogMode, entityData, program);
      }
    }

    if (level === ProgramBuilderLevel.EVENTS) {
      if (!!currentNode.data?.nodeEntityData?.eventTemplateId) {
        this.openTemplatedEventGroupDialog(
          programStageId,
          parentEntityData,
          this.eventService.getEventAccordionViewId(data.nodeEntityData)
        );
      } else if (this.selectedEventGroupType === EventGroupType.PUBLISHED) {
        this.openNonTemplatedEventGroup(
          dialogMode,
          parentEntityData,
          program,
          this.eventService.getEventAccordionViewId(data.nodeEntityData)
        );
      } else {
        this.eventGroupService.setEventGroupDialogConfigData(
          DialogMode.EDIT,
          parentEntityData,
          this.form.getRawValue() as Program,
          null
        );
        this.eventService.setEventDialogConfigData(
          dialogMode,
          entityData,
          false,
          this.eventGroupService.getEventGroupDialogConfigData()
        );

        this.dialog.open(
          CreateEditEventComponent,
          {
            width: "1250px",
            hasBackdrop: true,
            disableClose: true,
            ariaLabel: 'create-edit-event-dialog'
          }
        );
      }
    }

    if (level === ProgramBuilderLevel.ACTIONS) {
      const scrollId = this.eventActionService.getEventActionAccordionViewId(data.nodeEntityData);

      if (!!currentNode.data?.nodeEntityData?.eventActionTemplateId) {
        this.openTemplatedEventGroupDialog(
          programStageId,
          grandParentNode?.data?.nodeEntityData,
          this.eventActionService.getEventActionAccordionViewId(data.nodeEntityData)
        );
      } else if (this.selectedEventGroupType === EventGroupType.PUBLISHED) {
        this.openNonTemplatedEventGroup(dialogMode, grandParentNode?.data?.nodeEntityData, program, scrollId);
      } else {
        this.eventService.setEventDialogConfigData(
          DialogMode.EDIT,
          parentEntityData,
          false,
          this.eventGroupService.getEventGroupDialogConfigData()
        );

        this.eventActionService.setEventActionDialogConfigData(
          parentEntityData?.eventStatus === StatusCode.PENDING_REVIEW ? DialogMode.VIEW : dialogMode,
          entityData,
          false,
          this.eventService.getEventDialogConfigData(),
          this.eventGroupService.getEventGroupDialogConfigData()
        )

        this.dialog.open(
          AddEventActionComponent,
          {
            hasBackdrop: true, disableClose: true, width: '1250px',
            ariaLabel: 'add-action-dialog'
          });
      }
    }
  }

  getImportableItems(filter: any = {}): Observable<PaginationResponse<any[]>> | null {
    let searchCallback = null;

    if (this.selectedNodeLevel === ProgramBuilderLevel.EVENTS) {
      searchCallback = this.eventService.getReusableEvents(this.programService.communityCode);
    }
    if (this.selectedNodeLevel === ProgramBuilderLevel.EVENT_GROUP) {
      searchCallback = this.eventGroupService.getReusableEventGroups(this.programService.communityCode);
    }

    return searchCallback;
  }

  getImportPanelTabs(): PanelTab[] {
    return (
      this.currentNodeSelection?.currentNode.data.nodeLevel
        ? [
          {
            label: `Reusable ${PROGRAM_BUILDER_LEVEL_DESC[this.selectedNodeLevel]}s`
          }
        ]
        : []
    );
  }

  getImportPanelTableColumns() {
    let columns: SearchTableColumn[] = [];

    if (this.selectedNodeLevel === ProgramBuilderLevel.EVENT_GROUP) {
      columns = [
        {
          key: 'eventGroupName',
          label: 'Event Group Name',
          sortable: false
        }
      ];
    }

    if (this.selectedNodeLevel === ProgramBuilderLevel.EVENTS) {
      columns = [
        {
          key: 'eventName',
          label: 'Event Name',
          sortable: false
        },
        {
          key: 'eventType',
          label: 'Event Type',
          sortable: false
        },
        {
          key: 'eventDescription',
          label: 'Event Description',
          sortable: false
        }
      ];
    }

    return columns;
  }


  private openImportModal(selectedItem: any) {
    let dialogConfig = {};

    const selectedNodeEntityData = this.currentNodeSelection?.currentNode?.data?.nodeEntityData;

    const parentNodeEntityData = this.currentNodeSelection?.parentNode?.data?.nodeEntityData;

    if (this.selectedNodeLevel === ProgramBuilderLevel.EVENT_GROUP) {
      dialogConfig = {
        data: selectedItem,
        type: 'event-group',
        openParentDialog: false,
        parentDialogData: {
          eventGroupDialogMode: DialogMode.EDIT,
          program: this.program
        }
      };
    }

    if (this.selectedNodeLevel === ProgramBuilderLevel.EVENTS) {
      dialogConfig = {
        data: selectedItem,
        type: 'event',
        openParentDialog: false,
        parentDialogData: {
          mode: DialogMode.EDIT,
          eventGroupDialogMode: this.mode,
          eventGroup: parentNodeEntityData as EventGroup,
          program: this.program
        },
        eventGroupDetails: parentNodeEntityData as EventGroup
      };
    }

    this.dialog.open(
      ImportEventModalComponent,
      {
        hasBackdrop: true, disableClose: true,
        data: dialogConfig,
        ariaLabel: 'import-event-dialog'
      }
    );

    this.closeImportPanel();
  }

  private closeImportPanel() {
    if (this.importPanel) {
      this.importPanel.closePanel();
    }
    this.isImportPanelOpen = false;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
