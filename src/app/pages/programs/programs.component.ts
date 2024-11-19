import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import {
  BadgeType,
  ButtonColor,
  ButtonIconType,
  DialogService,
  TooltipPosition
} from '@visa/vds-angular';
import { Subscription } from 'rxjs';
import { HttpService } from 'src/app/services/http/http.service';
import { NavStatusService } from 'src/app/services/nav-status/nav-status.service';
import { ModalComponent } from './new-program/modal/modal.component';
import { PrequisitesModalComponent } from './prequisites-modal/prequisites-modal.component';
import {
  Setup,
  TemplateTableData,
  TemplateTableHeader
} from './programs.constants';

@Component({
  selector: 'app-programs',
  templateUrl: './programs.component.html',
  styleUrls: ['./programs.component.scss']
})
export class ProgramsComponent implements OnInit, OnDestroy {
  buttonColor = ButtonColor;
  buttonIconType = ButtonIconType;
  tooltipPosition = TooltipPosition;
  badgeType = BadgeType;

  setup = Setup;
  templateTableHeader = TemplateTableHeader;
  // originalTableData = TemplateTableData;
  originalTableData: any[] = [];
  templateTableData = [...this.originalTableData];

  showTemplateTable = true;
  selectedIndex: any[] = [];
  sortBy: string[] = Array(this.templateTableHeader.length)
    .fill('-ascending', 0, 1)
    .fill('', 1);
  openedMenu = -1;
  tableWidth = window.innerWidth - 240 - 46 - 46 - 272 - 80 + 'px';

  navOpen = true;
  isPanelOpen = false;
  panelSection = 0;

  searchPanel = this.fb.group({
    name: '',
    type: '',
    status: ''
  });
  searchActivate = false;

  serviceSubscriptions: Subscription[] = [];

  communityCode = 'GAPCL';
  page = 0;
  size = 50;
  totalElements = 0;
  sortColumnName:
    | 'programName'
    | 'programType'
    | 'programDescription'
    | 'programStartDate'
    | 'programEndDate' = 'programName';
  sortColumnType: 'asc' | 'desc' = 'asc';

  constructor(
    private dialogService: DialogService,
    private status: NavStatusService,
    private fb: FormBuilder,
    private http: HttpService,
    private router: Router
  ) {
    let navSubscriber = this.status.getStatus().subscribe({
      next: res => {
        this.navOpen = res;
        this.resizeTable();
      }
    });
    let panelSubscriber = this.status.getPanelStatus.subscribe({
      next: res => {
        this.isPanelOpen = res;
        this.resizeTable();

        if (!this.isPanelOpen && !this.searchActivate) {
          this.clearSearch();
        }
      }
    });
    let dialogSubscriber = this.dialogService.afterClosed().subscribe(res => {
      if (res.status == 'proceed') {
        this.getTableData();
      }
      if (res.status == 'basicsPage') {
        this.router.navigate(
          ['program', res.res.program.programStageId, 'basics'],
          { queryParamsHandling: 'merge' }
        );
      }
    });
    let prevSearchValue = { name: '', value: '', type: '' };
    let searchFormsubscriber = this.searchPanel.valueChanges.subscribe(res => {
      if (JSON.stringify(res) != JSON.stringify(prevSearchValue)) {
        prevSearchValue = res;
        if (this.searchActivate) {
          this.search();
        }
      }
    });

    this.serviceSubscriptions.push(navSubscriber);
    this.serviceSubscriptions.push(panelSubscriber);
    this.serviceSubscriptions.push(dialogSubscriber);
    this.serviceSubscriptions.push(searchFormsubscriber);
  }

  ngOnInit(): void {
    this.getTableData();
  }
  ngOnDestroy(): void {
    this.serviceSubscriptions.map(sub => {
      sub.unsubscribe();
    });
  }

  getTableData() {
    const formvalues = this.searchPanel.getRawValue();

    let parmsObj = {
      communityCode: this.communityCode,
      page: this.page,
      size: this.size,
      sort: `${this.sortColumnName},${this.sortColumnType}`,
      ...(this.searchActivate && {
        ...(formvalues.name && { programName: formvalues.name }),
        ...(formvalues.type && { programType: formvalues.type }),
        ...(formvalues.status && { statusCode: formvalues.status })
      })
    };

    this.http.get('api/program/listPrograms', parmsObj).subscribe({
      next: (res: any) => {
        res.body = JSON.parse(res.body);
        this.originalTableData = res.body.data;
        this.templateTableData = [...this.originalTableData];

        this.totalElements = res.body.page.totalElements;
      },
      error: err => {
        console.log(err);
      }
    });
  }
  showTemplates() {
    this.showTemplateTable = true;
  }
  openPrequisitesModal() {
    this.dialogService.open(PrequisitesModalComponent, { data: this.setup });
  }
  openNewProgramModal() {
    this.dialogService.open(ModalComponent);
  }

  openPanel(option: number) {
    this.panelSection = option;
    this.status.panelStatusChanged(true);
    this.searchActivate = false;
  }

  search() {
    this.searchActivate = true;
    this.status.panelStatusChanged(false);

    this.getTableData();
  }
  clearSearch() {
    this.searchPanel.setValue({ name: '', type: '', status: '' });
    this.searchActivate = false;
  }

  handlePagination(e: any) {
    this.page = e.pageIndex;
    this.size = e.pageSize; //not necessary

    this.getTableData();
  }

  selectAllHandler(e: Event) {
    const validClick = (e.target as HTMLInputElement).classList.contains(
      'vds-checkbox'
    );

    if (validClick) {
      if ((e.target as HTMLInputElement).checked) {
        this.selectedIndex = this.templateTableData.map((data, i) => i);
        this.status.panelStatusChanged(false);
      } else this.selectedIndex = [];
    }
  }

  checkboxHandler(e: any, index: number) {
    if (!e.checked) {
      this.selectedIndex = this.selectedIndex.filter(i => i !== index);
    } else if (e.checked && !this.selectedIndex.includes(index)) {
      this.selectedIndex = [...this.selectedIndex, index];
      this.status.panelStatusChanged(false);
    }
  }

  handleSort(col: any, indx: number) {
    if (this.sortBy[indx] !== '-descending') {
      this.sortBy = this.sortBy.map((res, i) =>
        indx === i ? '-descending' : ''
      );
    } else {
      this.sortBy = this.sortBy.map((res, i) =>
        indx === i ? '-ascending' : ''
      );
    }
    this.sortColumnName = col;
    this.sortColumnType = this.sortBy[indx] == '-descending' ? 'desc' : 'asc';
    this.getTableData();
  }

  resizeTable() {
    let navWidth = window.innerWidth <= 768 ? 0 : this.navOpen ? 240 : 56;
    let panelWidth = this.isPanelOpen ? 640 : 0;

    this.tableWidth =
      window.innerWidth - navWidth - panelWidth - 46 - 46 - 272 - 80 + 'px';
  }

  @HostListener('document:click', ['$event']) blurEvent(event: any) {
    let classList: string[] = [];
    let pathName = event.composedPath();

    pathName.pop();
    pathName.pop();
    pathName.map((val: any) => {
      let arr = val?.getAttribute('class')?.split(' ');
      if (arr) {
        arr.map((i: string) => {
          classList.push(i);
        });
      }
    });
    if (classList.includes('ignore-host-blur')) {
      return;
    }
    this.openedMenu = -1;
  }
  @HostListener('window:resize') resizeEvent() {
    this.resizeTable();
  }
}
