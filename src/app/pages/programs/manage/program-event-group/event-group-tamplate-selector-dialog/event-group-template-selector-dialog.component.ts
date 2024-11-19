import { Component, Inject, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ButtonColor, ButtonIconType } from '@visa/vds-angular';
import { SearchTableComponent } from 'src/app/shared/search-table/search-table.component';
import { SearchTableColumn } from 'src/app/shared/search-table/search-table.model';
import { COMMA } from 'src/app/core/constants';
import { StatusCode } from 'src/app/core/models/status.model';
import { EventGroupTemplate } from 'src/app/pages/event-group-template/event-group-template.model';
import { EventGroupTemplateService } from 'src/app/services/event-group-template.service';
import { GarbageCollectorService } from 'src/app/services/garbage-collector.service';
import { DialogService } from 'src/app/services/dialog/dialog.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-event-group-template-selector-dialog',
  templateUrl: './event-group-template-selector-dialog.component.html',
  styleUrls: ['./event-group-template-selector-dialog.component.scss']
})
export class EventGroupTemplateSelectorDialogComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  @ViewChild(SearchTableComponent)
  tableComponent!: SearchTableComponent;

  ButtonColor = ButtonColor;
  ButtonIconType = ButtonIconType;

  showLoader: boolean = false;


  tableColumns: SearchTableColumn[] = [];

  get selectedAnyTemplate(): boolean {
    return !!this.tableComponent?.selection?.selected?.length;
  }

  constructor(
    private eventGroupTemplateService: EventGroupTemplateService,
    private viewContainerRef: ViewContainerRef,
    private dialogService: DialogService,
    private dialogRef: MatDialogRef<EventGroupTemplateSelectorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private dialogConfig: any
  ) {
    this.tableColumns.push(...this.eventGroupTemplateService.getEventGroupTemplateTableColumns(true));

    this.dialogService.setDialogEventListeners(
      this.dialogRef,
      () => { this.close(); }
    ).pipe(takeUntil(this.destroy$)).subscribe();
  }


  ngOnInit(): void {

  }

  getEventGroupTemplates(filters: any = {}) {
    const params: any = {
      statusCode: [StatusCode.ACTIVE, StatusCode.APPROVED].join(COMMA),
      ...filters
    };

    return this.eventGroupTemplateService.advancedSearch(params);
  }


  close(selectedTemplate?: any) {
    this.dialogRef.close({ selectedTemplate: selectedTemplate });
  }

  performSelection() {
    const selectedItem: EventGroupTemplate = this.tableComponent?.selection?.selected[0];

    this.close(selectedItem);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    GarbageCollectorService.clearDetachedDOMElements(
      this,
      this.viewContainerRef
    );
  }
}