import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AlertType, ButtonColor } from '@visa/vds-angular';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DateTimeFormat, SUCCESS_CODE, VisaIcon } from 'src/app/core/constants';
import { PaginationResponse } from 'src/app/core/models/pagination-response.model';
import { STATUS_BADGE_TYPE, STATUS_DESC, StatusCode } from 'src/app/core/models/status.model';
import { CreateEditEventGroupComponent } from 'src/app/pages/programs/manage/program-event-group/create-edit-event-group/create-edit-event-group.component';
import { DialogMode, Program } from 'src/app/pages/programs/program.model';
import { NavStatusService } from 'src/app/services/nav-status/nav-status.service';
import { EventGroupService } from 'src/app/services/program/event-group/event-group.service';
import { ProgramService } from 'src/app/services/program/program.service';
import { ToggleAlertService } from 'src/app/services/toggle-alert/toggle-alert.service';
import { UncategorizedOfferService } from 'src/app/services/uncategorized-offer/uncategorized-offer.service';
import { Utils } from 'src/app/services/utils';
import { PanelComponent } from 'src/app/shared/panel/panel.component';
import { PanelAction } from 'src/app/shared/panel/panel.model';
import { SearchTableComponent } from 'src/app/shared/search-table/search-table.component';
import { SearchTableColumn, SortDirection, SortType } from 'src/app/shared/search-table/search-table.model';
import { UncategorizedOffer } from '../../../uncategorized-offers.model';

@Component({
  selector: 'app-uncategorized-offer-summary',
  templateUrl: './uncategorized-offer-summary.component.html',
  styleUrls: ['./uncategorized-offer-summary.component.scss']
})
export class UncategorizedOfferSummaryComponent implements AfterViewInit, OnInit {

  @ViewChild('importPanel')
  importPanel!: PanelComponent;

  @ViewChild('importPanelTable')
  importPanelTable!: SearchTableComponent;

  @Input()
  form!: UntypedFormGroup;

  private destroy$ = new Subject<void>();

  DateTimeFormat = DateTimeFormat;
  StatusCode = StatusCode;
  VisaIcon = VisaIcon
  ButtonColor = ButtonColor;
  SortType = SortType;

  STATUS_DESC = STATUS_DESC;
  STATUS_BADGE_TYPE = STATUS_BADGE_TYPE;

  Utils = Utils;

  alertType = AlertType.ERROR;

  isImportPanelOpen: boolean = false;

  columns: SearchTableColumn[] = [
    {
      key: 'vopId',
      label: 'VOP Id',
      sortDirection: SortDirection.ASC
    },
    {
      key: 'typeField',
      label: 'Type'
    },
    {
      key: 'nameField',
      label: 'Value'
    }
  ];

  importPanelColumns: SearchTableColumn[] = [
    {
      key: 'programName',
      label: 'Name',
    }
  ];

  importPanelActions: PanelAction[] = [
    {
      label: 'IMPORT',
      buttonColor: ButtonColor.PRIMARY,
      click: () => this.importOffer(),
      disabled: () => !this.importPanelTable?.selection?.selected?.length
    },
    {
      label: 'Cancel',
      buttonColor: ButtonColor.SECONDARY,
      click: () => {
        this.closeImportPanel()
      }
    }
  ];

  get tableHeight(): string{
    let numberOfRows = this.offer.unsupportedFeatureList.length;
    return (numberOfRows * 72) + 48 > 408 ? '408px' : `${numberOfRows * 72 + 48}px`;
  }

  get offer(): UncategorizedOffer {
    return this.form.getRawValue() as UncategorizedOffer;
  }

  constructor(
    private navStatusService: NavStatusService,
    private programService: ProgramService,
    private offerService: UncategorizedOfferService,
    private eventGroupService: EventGroupService,
    private alertService: ToggleAlertService,
    private dialog: MatDialog
  ) { }

  ngAfterViewInit(): void {
  }

  ngOnInit(): void {
    this.navStatusService.getPanelStatus
      .pipe(takeUntil(this.destroy$)).subscribe(response => {
        if (response === false) {
          this.isImportPanelOpen = false;
        }
      });
  }

  private openEventGroupDialog(offer: UncategorizedOffer, program: Program) {
    this.eventGroupService.setEventGroupDialogConfigData(
      DialogMode.EDIT,
      offer!,
      program,
      null
    );

    this.dialog.open(
      CreateEditEventGroupComponent,
      {
        hasBackdrop: true,
        disableClose: true,
        width: '1250px',
        ariaLabel: 'create-edit-event-group-dialog'
      }
    );

  }


  private closeImportPanel() {
    if (this.importPanel) {
      this.importPanel.closePanel();
    }
    this.isImportPanelOpen = false;
  }

  private importOffer() {
    const selectedProgram: Program = this.importPanelTable?.selection?.selected?.[0];

    if (selectedProgram) {
      this.offerService.importOffer(this.offer.vopOfferId!, selectedProgram?.programStageId!)
        .subscribe(
          {
            next: response => {

              if ((response.statusCode === SUCCESS_CODE) && Utils.isNull(response.errors)) {
                this.closeImportPanel();
                this.openEventGroupDialog(response.data, selectedProgram);
              } else {
                this.alertService.showResponseErrors(response.errors);
              }
            },
            error: err => console.log(err)
          }
        );
    }

  }

  public openImportPanel() {
    this.dialog.closeAll();

    this.navStatusService.togglePanel(false);

    this.isImportPanelOpen = true;

    this.navStatusService.togglePanel(true);

  }


  getProgramList(filters: any = {}): Observable<PaginationResponse<any>> {
    const params = {
      communityCode: this.offer.communityCode,
      ...filters
    };

    return this.programService.getProgramList(params);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
