import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SearchTableComponent } from 'src/app/components/search-table/search-table.component';
import {
  SearchField,
  SearchFieldType,
  SearchTableColumn,
  SearchTableColumnType,
  SortDirection
} from 'src/app/components/search-table/search-table.model';
import { Indicator } from 'src/app/core/models/indicator.model';
import { HttpService } from 'src/app/services/http/http.service';
import { EpmTemplate, EpmTemplateField } from '../../explore-template.model';
import { Utils } from 'src/app/services/utils';
import { EventGroupService } from 'src/app/services/program/event-group/event-group.service';
import { DialogMode, Program } from 'src/app/pages/programs/program.model';
import { DialogService } from '@visa/vds-angular';
import { CreateEditEventGroupComponent } from 'src/app/pages/programs/manage/program-event-group/create-edit-event-group/create-edit-event-group.component';
import { ProgramService } from 'src/app/services/program/program.service';
import { EventService } from 'src/app/services/program/event/event.service';
import { CreateEditEventComponent } from 'src/app/pages/programs/manage/program-event-group/create-edit-event/create-edit-event.component';
import { EventActionService } from 'src/app/services/program/event-action/event-action.service';
import { AddEventActionComponent } from 'src/app/pages/programs/manage/program-event-group/create-edit-event/event-actions/add-event-action/add-event-action.component';
import { StatusCode } from 'src/app/core/models/status.model';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-linked-event-group',
  templateUrl: './linked-event-group.component.html',
  styleUrls: ['./linked-event-group.component.scss']
})
export class LinkedEventGroupComponent implements OnInit {
  @ViewChild('linkedEventGroupTable')
  linkedEventGroupTable!: SearchTableComponent;

  @Input()
  epmTemplateForm!: FormGroup

  private destroy$ = new Subject<void>();

  program!: Program;

  showLoader: boolean = false;


  tableColumns: SearchTableColumn[] = [
    {
      key: 'eventGroupName',
      label: 'Event Group Name',
      sortDirection: SortDirection.ASC,
      type: SearchTableColumnType.LINK,
      fixed: true,
      click: (row: any, component: SearchTableComponent) => {
        const mode =
          (row.eventGroupStatus === StatusCode.PENDING_REVIEW || row.eventGroupStatus === StatusCode.PENDING_DEACTIVATION_REVIEW)
            ? DialogMode.VIEW
            : DialogMode.EDIT

        if (Utils.isNull(row.eventGroupTemplateId)) {
          this.openEventGroupDialog(row, mode)
        } else {
          this.eventGroupService.openEventGroupByTemplateDialog(
            {
              dialogMode: mode,
              eventGroupId: row.eventGroupId,
              eventGroupTemplateId: row.eventGroupTemplateId,
              programStageId: row.programStageId
            }
          );
        }
      }
    },
    {
      key: 'eventName',
      label: 'Event Name',
      type: SearchTableColumnType.LINK,
      click: (row: any, component: SearchTableComponent) => {
        const mode = DialogMode.EDIT;

        if (Utils.isNull(row.eventGroupTemplateId)) {
          this.openEventDialog(row, mode);
        } else {
          this.eventGroupService.openEventGroupByTemplateDialog(
            {
              dialogMode: mode,
              eventGroupId: row.eventGroupId,
              eventGroupTemplateId: row.eventGroupTemplateId,
              programStageId: row.programStageId,
              viewId: 'event-' + row.eventName + row.eventId
            }
          );
        }
      }
    },
    {
      key: 'actionName',
      label: 'Action Name',
      type: SearchTableColumnType.LINK,
      click: (row: any, component: SearchTableComponent) => {
        const mode = DialogMode.EDIT;

        if (Utils.isNull(row.eventGroupTemplateId)) {
          this.openEventActionDialog(row, mode)
        } else {
          this.eventGroupService.openEventGroupByTemplateDialog(
            {
              dialogMode: mode,
              eventGroupId: row.eventGroupId,
              eventGroupTemplateId: row.eventGroupTemplateId,
              programStageId: row.programStageId,
              viewId: 'eventAction-' + row.actionName + row.actionStageId
            }
          );
        }
      }
    },
    {
      key: 'eventStartDate',
      label: 'Event Start Date Time',
      type: SearchTableColumnType.DATE
    },
    {
      key: 'eventEndDate',
      label: 'Event End Date Time',
      type: SearchTableColumnType.DATE
    },
    {
      key: 'statusCode',
      label: 'Event Status',
      type: SearchTableColumnType.STATUS
    }
  ];

  advancedSearchFields: SearchField[] = [
    {
      key: 'status',
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
    }
  ];

  tableData: any[] = [];


  get epmTemplate(): EpmTemplate {
    return this.epmTemplateForm.getRawValue() as EpmTemplate;
  }

  constructor(
    private http: HttpService,
    private eventService: EventService,
    private eventGroupService: EventGroupService,
    private eventActionService: EventActionService,
    private programService: ProgramService,
    private route: ActivatedRoute,
    private dialog: MatDialog
  ) { }

  private openEventGroupDialog(
    eventDetails: any,
    mode: DialogMode
  ) {
    this.getProgram(eventDetails.programStageId);
    this.getEventGroup(eventDetails, mode);
  }

  private openEventDialog(
    eventDetails: any,
    mode: DialogMode
  ) {
    this.getEvent(eventDetails, mode);
  }

  private openEventActionDialog(
    eventDetails: any,
    mode: DialogMode
  ) {
    this.getEventAction(eventDetails, mode);
  }

  private updateEventGroups(res: any) {
    if (!!res?.isSubmitRequest) {
      this.linkedEventGroupTable?.performSearch(0);
    }
  }

  private getEventGroup(eventDetails: any, mode: DialogMode) {
    this.eventGroupService.getEventGroup(eventDetails.programStageId, eventDetails.eventGroupId).subscribe({
      next: res => {
        if (res.success && Utils.isNull(res.errors)) {

          this.eventGroupService.setEventGroupDialogConfigData(
            mode,
            res.data,
            this.program,
            null,
            false
          );

          this.dialog.open(
            CreateEditEventGroupComponent,
            {
              hasBackdrop: true, disableClose: true,
              width: '1250px'
            }
          ).afterClosed()
            .pipe(takeUntil(this.destroy$))
            .subscribe(res => this.updateEventGroups(res));
        }
      }
    });
  }

  private getEvent(eventDetails: any, mode: DialogMode) {
    this.eventService.getEvent(eventDetails.eventId).subscribe({
      next: res => {
        if (res.success && Utils.isNull(res.errors)) {
          this.eventService.setEventDialogConfigData(
            mode,
            res.data,
            false,
            null
          );

          this.dialog.open(
            CreateEditEventComponent,
            {
              hasBackdrop: true,
              disableClose: true,
              width: '1250px'
            }).afterClosed()
            .pipe(takeUntil(this.destroy$))
            .subscribe(res => this.updateEventGroups(res));
        }
      }
    });
  }

  private getEventAction(eventDetails: any, mode: DialogMode) {
    this.eventService.getEvent(eventDetails.eventId).subscribe({
      next: res => {

        if (res.success && Utils.isNull(res.errors)) {
          this.eventService.setEventDialogConfigData(
            mode,
            res.data,
            false,
            null
          );

          const actions = res.data.eventActions.find(action => action.id === eventDetails.actionStageId);

          this.eventActionService.setEventActionDialogConfigData(
            mode,
            actions!,
            false,
            this.eventService.getEventDialogConfigData(),
            null
          );

          this.dialog.open(
            AddEventActionComponent,
            {
              hasBackdrop: true, disableClose: true,
              width: '1250px'
            })
            .afterClosed()
            .pipe(takeUntil(this.destroy$))
            .subscribe(res => this.updateEventGroups(res));
        }
      }
    });
  }

  private getProgram(stageId: number) {
    this.programService.getProgram(stageId).subscribe({
      next: res => {
        if (res && Utils.isNull(res.errors)) {
          this.program = res.data;
        }
      }
    });
  }

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    this.linkedEventGroupTable.searchActivate = true;
    this.linkedEventGroupTable.advancedSearchForm
      .get('status')
      ?.patchValue(Indicator.yes);
  }

  getMessageDetails(filters: any = {}) {
    switch (filters.status) {
      case Indicator.yes:
        this.getPublishedMessageDetails();
        break;
      case Indicator.no:
        this.getUnpublishedMessageDetails();
        break;
    }
    return null;
  }

  getPublishedMessageDetails() {
    this.showLoader = true;

    const param = {
      communityCode: this.route.snapshot.queryParams['client']
    };

    this.http
      .get(
        'api/v1/message/publishedEndpointMessage/' + this.epmTemplate[EpmTemplateField.TEMPLATE_MESSAGE_ID],
        param
      )
      .subscribe({
        next: (res: any) => {
          this.showLoader = false;

          res = JSON.parse(res.body);
          this.tableData = res.data.eventsUsingEPMMessage;
        },
        error: err => {
          this.showLoader = false;
          console.log(err);
        }
      });
  }

  getUnpublishedMessageDetails() {
    this.showLoader = true;

    const param = {
      communityCode: this.route.snapshot.queryParams['client']
    };

    this.http
      .get('api/v1/message/endpointMessage/' + this.epmTemplate[EpmTemplateField.TEMPLATE_MESSAGE_ID], param)
      .subscribe({
        next: (res: any) => {
          this.showLoader = false;

          res = JSON.parse(res.body);
          this.tableData = res.data.eventsUsingEPMMessage;
        },
        error: err => {
          this.showLoader = false;
          console.log(err);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}