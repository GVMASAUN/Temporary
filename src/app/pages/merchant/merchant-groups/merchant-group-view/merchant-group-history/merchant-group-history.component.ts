import { AfterViewInit, Component, OnDestroy, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { Observable, Subject, map, takeUntil } from "rxjs";
import { PaginationResponse } from "src/app/core/models/pagination-response.model";
import { MerchantGroupService } from "src/app/services/merhant-group/merchant-group.service";
import { TableDataCountService } from "src/app/services/private/table-data-count.service";
import { MerchantGroupHistory } from "../../../merchant.model";
import { PaginationSizeValue, SearchField, SearchFieldType, SearchTableColumn, SearchTableColumnType } from "src/app/shared/search-table/search-table.model";
import { Option } from "src/app/core/models/option.model";
import { User } from 'src/app/pages/users/user.model';
import { ANY, COMMA_PATTERN, DateTimeFormat, EMPTY, NEWLINE, SPACE, SUCCESS_CODE, ZERO } from "src/app/core/constants";
import { MatDialog } from "@angular/material/dialog";
import { HistoryDetailsDialogComponent } from "src/app/shared/history-details-dialog/history-details-dialog.component";
import { HistoryDetailsDialogConfig } from "src/app/shared/history-details-dialog/history-details-model";
import { Utils } from "src/app/services/utils";
import { StatusCode } from "src/app/core/models/status.model";
import { ToggleAlertService } from "src/app/services/toggle-alert/toggle-alert.service";
import { DateUtils } from "src/app/services/util/dateUtils";

@Component({
  selector: 'app-merchant-group-history',
  templateUrl: './merchant-group-history.component.html'
})
export class MerchantGroupHistoryComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('columnChangesMade')
  columnChangesMadeTemplate!: TemplateRef<any>;

  private destroy$ = new Subject<void>();

  groupId!: string;
  communityCode!: String;

  searchFields!: SearchField[];

  tableColumns: SearchTableColumn[] = [];

  constructor(
    private dataPool: TableDataCountService,
    private dialog: MatDialog,
    private alertService: ToggleAlertService,
    private merchantGroupService: MerchantGroupService
  ) { }

  private getHistoryUsersList(): Observable<Array<Option>> {
    const params = {
      communityCode: this.communityCode,
      id: this.groupId,
    };

    return this.merchantGroupService.getHistoryUserList(params)
      .pipe(
        map((paginationResponse: PaginationResponse<Array<User>>) => {
          const usersArray: User[] = paginationResponse.data || [];

          const optionsArray: Option[] = usersArray.map((user: User) => {
            const userFullName = user.firstName?.concat(SPACE, user.lastName!);
            return new Option(user.volId, userFullName!);
          });
          optionsArray.unshift(new Option(EMPTY, ANY));
          return optionsArray;
        })
      );
  }

  private setSearchFields() {
    this.searchFields = [
      {
        key: 'modifiedUserId',
        label: 'Responsible User',
        type: SearchFieldType.DROPDOWN,
        options: this.getHistoryUsersList()
      },
      {
        key: 'modificationStartDate',
        label: 'Action Start Date',
        type: SearchFieldType.DATE,
      },
      {
        key: 'modificationEndDate',
        label: 'Action End Date',
        type: SearchFieldType.DATE,
      }
    ];
  }

  ngOnInit(): void {
    this.dataPool.getSelectedMerchant()
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (res: any) => {
          this.communityCode = res.communityCode;
          this.groupId = res.id;

          this.setSearchFields();
        }
      });
  }

  ngAfterViewInit(): void {
    this.initTableColumns();
  }

  private initTableColumns() {
    this.tableColumns = [
      {
        key: 'historyMessages',
        label: 'Changes Made',
        fixed: true,
        sortable: false,
        type: SearchTableColumnType.TEMPLATE,
        columnTemplateRef: this.columnChangesMadeTemplate,
        click: (row) => this.openHistoryDetailsDialog(row.id),
        cellStyle: () => {
          return 'white-space: pre-line;'
        }
      },
      {
        key: 'modifiedUserFullName',
        label: 'Responsible User',
        sortable: false,
        cellStyle: () => {
          return 'width: 20%'
        }
      },
      {
        key: 'modifiedDate',
        label: 'Modification Date',
        type: SearchTableColumnType.DATE,
        sortable: false,
        cellStyle: () => {
          return 'width: 20%'
        }
      }
    ]
  }

  mapColumn(data: Array<String>): string {
    return data.map((message) => message.replace(COMMA_PATTERN, EMPTY)).join(`${NEWLINE}${NEWLINE}`);
  }

  openHistoryDetailsDialog(historyId: string) {
    const params = {
      page: ZERO,
      size: PaginationSizeValue.PAGINATION_SIZE_50,
      communityCode: this.communityCode,
      id: this.groupId,
      historyId: historyId
    }

    this.merchantGroupService.getHistoryById(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if ((res.statusCode === SUCCESS_CODE) && (Utils.isNull(res.errors))) {

            const dialogConfig: HistoryDetailsDialogConfig = {
              data: res.data[0],
              dialogTitle: `Merchant Group - ${res.data[0].entityName}`,
              viewConfigs: [
                {
                  key: 'id',
                  label: 'Viewing History Record for history Id'
                },
                {
                  key: 'modifiedUserFullName',
                  label: 'Responsible User'
                },
                {
                  key: 'modifiedDate',
                  label: 'Modification Date',
                  mapValue: (date: string) => {
                    const formattedDate = DateUtils.formatDateTime(date, DateTimeFormat.MOMENT_MM_DD_YYYY_HH_MM_A);
                    const timeZone = DateUtils.getTimeZone();

                    return `${formattedDate} ${timeZone}`;
                  }
                }
              ],
              columns: [
                {
                  key: 'historyMessages',
                  label: 'Changes Made',
                  fixed: true,
                  sortable: false
                }
              ],
              dataSource: res.data[0].historyMessages!.map((message: string) => ({
                'historyMessages': message
              }))
            }

            this.dialog.open(
              HistoryDetailsDialogComponent,
              {
                hasBackdrop: true, disableClose: true,
                ariaLabel: 'view-more-history-dialog',
                width: '1250px',
                data: dialogConfig
              });
          } else {
            this.alertService.showResponseErrors(res.errors);
          }
        }
      })
  }

  getMerchantHistory(filters: any = {}): Observable<PaginationResponse<MerchantGroupHistory>> {
    const params = {
      communityCode: this.communityCode,
      id: this.groupId,
      ...filters
    }
    return this.merchantGroupService.getHistoryList(params);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}