import { AfterViewInit, Component, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { SearchTableComponent } from 'src/app/shared/search-table/search-table.component';
import { SearchField, SearchFieldType, SearchTableColumn, SearchTableColumnType, SortDirection } from 'src/app/shared/search-table/search-table.model';
import { NavStatusService } from 'src/app/services/nav-status/nav-status.service';
import { User, UserRole } from '../user.model';
import { PaginationResponse } from 'src/app/core/models/pagination-response.model';
import { UserService } from 'src/app/services/user/user.service';
import { COMMA, EMPTY, SPACE } from 'src/app/core/constants';
import { takeUntil } from 'rxjs/operators';
import { GarbageCollectorService } from 'src/app/services/garbage-collector.service';


@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements AfterViewInit, OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  userRoles: UserRole[] = [];

  tableColumns: SearchTableColumn[] = [
    {
      key: 'firstName',
      label: 'User Name',
      type: SearchTableColumnType.LINK,
      fixed: true,
      sortDirection: SortDirection.ASC,
      click: (row: any, component: SearchTableComponent) => {
        this.router.navigate(['users', 'manage', row.userId], {
          queryParamsHandling: 'merge'
        });
      },
      mapValue: (row: any, component: SearchTableComponent) => {
        if (row.firstName && row.lastName) {
          const userName = row.firstName + COMMA + SPACE + row.lastName;
          return userName
        }
        return undefined
      }
    },
    {
      key: 'email',
      label: 'Email'
    },
    {
      key: 'primaryRole',
      label: 'Role',
      sortable: false,
      mapValue: (row: any, component: SearchTableComponent) => {
        if (row.primaryRole) {
          return row.primaryRole.role
        }
      }
    }
  ];

  advancedSearchFields: SearchField[] = [];

  isPanelOpen: boolean = false;

  constructor(
    private router: Router,
    private navStatusService: NavStatusService,
    private userService: UserService,
    private viewContainerRef: ViewContainerRef
  ) { }

  private registerOnChangeListeners() {
    this.navStatusService.getPanelStatus
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: panelStatus => {
          this.isPanelOpen = panelStatus;
        }
      });
  }

  private getUserRoles() {
    this.userService.getUserRoles().subscribe({
      next: response => {
        this.userRoles = response.data

        this.setAdvancedSearchFields();
      }
    });
  }

  private setAdvancedSearchFields() {
    this.advancedSearchFields = [
      {
        key: 'firstName',
        label: 'First Name'
      },
      {
        key: 'lastName',
        label: 'Last Name'
      },
      {
        key: 'email',
        label: 'Email'
      },
      {
        key: 'role',
        label: 'Role',
        type: SearchFieldType.DROPDOWN,
        options: this.userRoles.map(role => ({
          label: role.role || EMPTY,
          value: role.roleId
        }))
      }
    ];
  }

  ngOnInit(): void {
    this.getUserRoles();
  }

  ngAfterViewInit(): void {
    this.registerOnChangeListeners();
  }

  getUserList(
    filters: any = {}
  ): Observable<PaginationResponse<Array<User>>> {
    return this.userService.getUserList(filters);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    GarbageCollectorService.clearDetachedDOMElements
      (
        this,
        this.viewContainerRef
      );
  }
}
