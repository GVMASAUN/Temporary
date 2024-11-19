import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UserService } from 'src/app/services/user/user.service';
import { UserHistory } from '../../user.model';
import { PaginationResponse } from 'src/app/core/models/pagination-response.model';
import { SearchTableColumn, SearchTableColumnType } from 'src/app/shared/search-table/search-table.model';
import { COMMA_PATTERN, EMPTY, NEWLINE } from 'src/app/core/constants';

@Component({
  selector: 'app-history',
  templateUrl: './user-history.component.html',
  styleUrls: ['./user-history.component.scss']
})
export class UserHistoryComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  userId: null | string = null;

  constructor(
    private route: ActivatedRoute,
    private userService: UserService
  ) { }

  tableColumns: SearchTableColumn[] = [
    {
      key: 'actionType',
      label: 'Action Type',
      fixed: true,
      sortable: false
    },
    {
      key: 'historyMessages',
      label: 'Changes Made',
      sortable: false,
      cellStyle: () => {
        return 'white-space: pre-line;'
      },
      mapValue: (row) => {
        if (row.historyMessages) {
          return row.historyMessages.map((message: string) => message.replace(COMMA_PATTERN, EMPTY)).join(`${NEWLINE}${NEWLINE}`);
        }
      }
    },
    {
      key: 'modifiedUserFullName',
      label: 'Responsible User',
      sortable: false
    },
    {
      key: 'modifiedDate',
      label: 'Modified Date',
      type: SearchTableColumnType.DATE,
      sortable: false
    }
  ];

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (params) => {
          this.userId = params.get('id');
        }
      });
  }

  getUserHistory(filters: any = {}): Observable<PaginationResponse<UserHistory>> {
    return this.userService.getUserHistory(this.userId, filters);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
