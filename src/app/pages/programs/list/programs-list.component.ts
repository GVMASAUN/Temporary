import { Component, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import {
  ButtonColor
} from '@visa/vds-angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SearchTableComponent } from 'src/app/shared/search-table/search-table.component';
import { SearchField, SearchFieldType, SearchTableAction, SearchTableColumn, SearchTableColumnType, SortDirection } from 'src/app/shared/search-table/search-table.model';
import { UserRole } from 'src/app/core/models/user.model';
import { AuthorizationService } from 'src/app/services/authorization.service';
import { GarbageCollectorService } from 'src/app/services/garbage-collector.service';
import { NavStatusService } from 'src/app/services/nav-status/nav-status.service';
import { ProgramService } from 'src/app/services/program/program.service';
import { CreateProgramDialogComponent } from '../create-program-dialog/create-program-dialog.component';
import { PrequisitesModalComponent } from '../prequisites-modal/prequisites-modal.component';
import { Setup } from '../programs.constants';
@Component({
  selector: 'app-programs-list',
  templateUrl: './programs-list.component.html',
  styleUrls: ['./programs-list.component.scss']
})
export class ProgramsListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  tableColumns: SearchTableColumn[] = [
    {
      key: 'programName',
      label: 'Name',
      sortDirection: SortDirection.ASC,
      type: SearchTableColumnType.LINK,
      fixed: true,
      click: (row: any, component: SearchTableComponent) =>
        this.router.navigate(['program', 'manage', row.programStageId], {
          queryParamsHandling: 'merge'
        })
    },
    {
      key: 'programTypeName',
      label: 'Type'
    },
    {
      key: 'programDescription',
      label: 'Description'
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
      key:'badge',
      label: 'Badge',
      type: SearchTableColumnType.BADGE
    }
  ];

  tableActions: SearchTableAction[] = [
    {
      label: 'CREATE NEW PROGRAM',
      buttonColor: ButtonColor.SECONDARY,
      click: () => this.openCreateProgramDialog()
    }
  ];


  advancedSearchFields: SearchField[] = [
    {
      key: 'programName',
      label: 'Program Name',
      type: SearchFieldType.INPUT
    }
  ];

  setup = Setup;
  isPanelOpen: boolean = false;

  get showProgramCreate(): boolean {
    return this.authorizationService?.getUserRole() !== UserRole.CLIENT_READ_ONLY;
  }

  constructor(
    private navStatusService: NavStatusService,
    private programService: ProgramService,
    private router: Router,
    private viewContainerRef: ViewContainerRef,
    private authorizationService: AuthorizationService,
    private dialog: MatDialog
  ) { }

  private registerOnChangeListeners() {
    this.navStatusService.getPanelStatus
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: panelStatus => {
          this.isPanelOpen = panelStatus;
        }
      });
  }

  private openCreateProgramDialog() {
      this.dialog.open(
        CreateProgramDialogComponent,
        {
          hasBackdrop: true,
          disableClose: true,
          width: "500px",
          ariaLabel: 'create-program-dialog'
        }
      );
  }


  ngAfterViewInit(): void {
    this.registerOnChangeListeners();
  }

  ngOnInit(): void { }

  getProgramList(filters: any = {}) {
    const params = {
      communityCode: this.programService.communityCode,
      ...filters
    };

    return this.programService.getProgramList(params);
  }

  openPrequisitesModal() {
    this.dialog.open(
      PrequisitesModalComponent,
      {
        data: this.setup,
        hasBackdrop: true, disableClose: true,
        ariaLabel: 'Prequisites-modal-dialog'
      }
    )
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
