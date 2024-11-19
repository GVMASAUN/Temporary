import { HttpStatusCode } from '@angular/common/http';
import { Component, Inject, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ButtonColor, ButtonType, CALENDAR_PLACEMENT, ComboboxType } from '@visa/vds-angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DateTimeFormat, EMPTY, NUMBER_PATTERN } from 'src/app/core/constants';
import { Option } from 'src/app/core/models/option.model';
import { StatusCode, StatusDesc } from 'src/app/core/models/status.model';
import { EventAttribute } from 'src/app/pages/programs/event.model';
import { DialogService } from 'src/app/services/dialog/dialog.service';
import { GarbageCollectorService } from 'src/app/services/garbage-collector.service';
import { AttributeService } from 'src/app/services/program/event/attribute/attribute.service';
import { ToggleAlertService } from 'src/app/services/toggle-alert/toggle-alert.service';
import { DateUtils } from 'src/app/services/util/dateUtils';
import { Utils } from 'src/app/services/utils';
import { SearchTableComponent } from 'src/app/shared/search-table/search-table.component';
import { SearchTableColumn, SearchTableColumnType, SortType } from 'src/app/shared/search-table/search-table.model';

@Component({
  selector: 'app-completed-event-selector-dialog',
  templateUrl: './completed-event-selector-dialog.component.html',
  styleUrls: ['./completed-event-selector-dialog.component.scss']
})
export class CompletedEventSelectorDialogComponent implements OnInit, OnDestroy {
  @ViewChild('completedEventTable')
  completedEventTable!: SearchTableComponent;

  private destroy$ = new Subject<void>();

  ButtonColor = ButtonColor;
  ButtonType = ButtonType;
  DateFormat = DateTimeFormat;
  ComboboxType = ComboboxType;
  CALENDAR_PLACEMENT = CALENDAR_PLACEMENT;
  NUMBER_PATTERN = NUMBER_PATTERN;
  SortType = SortType;

  selectedAttribute!: EventAttribute;
  communityCode!: string;

  minDate!: Date;
  maxDate!: Date;
  minStartDate: Date = new Date(new Date().setFullYear(new Date().getFullYear() - 1));
  maxEndDate: Date = new Date(new Date().setFullYear(new Date().getFullYear() + 3));

  isLoading: boolean = false;

  eventSearchForm: UntypedFormGroup = this.formBuilder.group({
    startDate: [EMPTY],
    endDate: [EMPTY],
    eventId: [EMPTY],
    eventName: [EMPTY],
    offerStatusCode: [EMPTY]
  });


  dataSource: any[] = [];


  completedEventColumns: SearchTableColumn[] = [
    {
      key: "offerId",
      label: "Offer Id"
    },
    {
      key: "eventGroupName",
      label: "Offer Name"
    },
    {
      key: "eventId",
      label: "Event Id"
    },
    {
      key: "eventName",
      label: "Event Name"
    },
    {
      key: "eventStartDate",
      label: "Start Date",
      type: SearchTableColumnType.DATE
    },
    {
      key: "eventEndDate",
      label: "End Date",
      type: SearchTableColumnType.DATE
    },
    {
      key: "status",
      label: "Offer Status"
    }
  ];

  statuses: Option[] = [
    {
      label: 'Any',
      value: EMPTY
    },
    {
      label: StatusDesc.ACTIVE,
      value: StatusCode.ACTIVE
    },
    {
      label: StatusDesc.INACTIVE,
      value: StatusCode.INACTIVE
    },
    {
      label: StatusDesc.DRAFT,
      value: StatusCode.DRAFT
    },
    {
      label: StatusDesc.PENDING_DEACTIVATION_REVIEW,
      value: StatusCode.PENDING_DEACTIVATION_REVIEW
    },
    {
      label: StatusDesc.DEACTIVATION_REJECTED,
      value: StatusCode.DEACTIVATION_REJECTED
    },
    {
      label: StatusDesc.DRAFT,
      value: StatusCode.DRAFT
    },
    {
      label: StatusDesc.PENDING_REVIEW,
      value: StatusCode.PENDING_REVIEW
    },
    {
      label: StatusDesc.REJECT,
      value: StatusCode.REJECTED
    },
    {
      label: StatusDesc.APPROVED,
      value: StatusCode.APPROVED
    },
    {
      label: StatusDesc.ERROR,
      value: StatusCode.ERROR
    }
  ];

  get selected(): boolean {
    return !!this.completedEventTable?.selection.selected?.length;
  }

  constructor(
    private attributeService: AttributeService,
    private formBuilder: UntypedFormBuilder,
    private alertService: ToggleAlertService,
    private viewContainerRef: ViewContainerRef,
    private dialogService: DialogService,
    private dialogRef: MatDialogRef<CompletedEventSelectorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private dialogConfig: any
  ) {
    this.selectedAttribute = this.dialogConfig?.selectedAttribute;
    this.communityCode = this.dialogConfig?.communityCode;

    this.dialogService.setDialogEventListeners(
      this.dialogRef,
      () => { this.close(); }
    ).pipe(takeUntil(this.destroy$)).subscribe();
  }

  ngOnInit(): void {
  }

  setMinDate(date: any): void {
    this.minDate = date;
  }

  setMaxDate(date: any): void {
    this.maxDate = date;
  }

  findCompletedEvents(): void {
    this.isLoading = true;
    this.attributeService
      .getAttributeValues(
        this.selectedAttribute.apiPath!,
        this.selectedAttribute.attributeId!,
        {
          eventId: this.eventSearchForm.value?.eventId || EMPTY,
          eventName: this.eventSearchForm.value?.eventName || EMPTY,
          offerStatusCode: this.eventSearchForm.value?.offerStatusCode || EMPTY,
          startDate: DateUtils.formatDateTime(this.eventSearchForm?.value?.startDate, (DateTimeFormat.MOMENT_YYYY_MM_DD)),
          endDate: DateUtils.formatDateTime(this.eventSearchForm?.value?.endDate, (DateTimeFormat.MOMENT_YYYY_MM_DD)),
          communityCode: this.communityCode
        }
      ).pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        this.isLoading = false;

        if ((res.statusCode === HttpStatusCode.Ok) && Utils.isNull(res.errors)) {
          this.dataSource = (res.data || []);

        } else {
          this.alertService.showResponseErrors(res.errors);
          this.dataSource = [];
        }
      });

  }

  addEvents(): void {
    this.dialogRef.close(this.completedEventTable?.selection.selected.map(item => ({ id: item?.eventId, label: item?.eventName })));
  }


  close(): void {
    this.dialogRef.close();
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
