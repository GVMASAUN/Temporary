import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { ButtonColor, ButtonIconType } from '@visa/vds-angular';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SearchTableComponent } from 'src/app/shared/search-table/search-table.component';
import { RowAction, SearchTableColumn, SearchTableColumnType, SortType } from 'src/app/shared/search-table/search-table.model';
import { EMPTY, SUCCESS_CODE, VisaIcon } from 'src/app/core/constants';
import { Option } from 'src/app/core/models/option.model';
import { UserRole } from 'src/app/core/models/user.model';
import { ToggleAlertService } from 'src/app/services/toggle-alert/toggle-alert.service';
import { UserService } from 'src/app/services/user/user.service';
import { Utils } from 'src/app/services/utils';
import { Action, Bid, PRIMARY_BID_ERROR, Region, User } from '../../user.model';
import { CommunityListComponent } from './community-list/community-list.component';

@Component({
  selector: 'app-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.scss']
})
export class UserDetailsComponent implements OnInit, OnDestroy {
  ButtonColor = ButtonColor;
  ButtonIconType = ButtonIconType;
  UserRole = UserRole;
  VisaIcon = VisaIcon;
  SortType = SortType;

  private destroy$ = new Subject<void>();
  private readonly successMessage = "User details updated successfully.";

  user!: User;


  assignedRegionOptions: Option[] = [];

  additionalBidList: Bid[] = [];

  subscriptions: Subscription[] = [];

  tableColumns: SearchTableColumn[] = [
    {
      key: 'bid',
      label: 'BID Assigned',
      fixed: true
    },
    {
      key: 'communityLevels',
      label: 'Communities',
      sortable: false,
      type: SearchTableColumnType.LINK,
      click: (row: any) => {
        this.openCommunitiesDialog(row);
      },
      mapValue(row: any, component: SearchTableComponent) {
        if (row.communityLevels) {
          return row.communityLevels.length;
        }
      },
    }
  ];

  rowActions: RowAction[] = [
    {
      icon: VisaIcon.DELETE,
      click: (row: any) => {
        this.removeAdditionalBid(row.bid);
      }
    }
  ]


  assignedBIDForm: UntypedFormGroup = this.formBuilder.group(new Bid());

  initCheckbox: boolean = true;


  get bid(): string {
    return this.assignedBIDForm.get('bid')?.value;
  }

  get disabledAssignedRegions(): boolean {
    return false;
  }


  constructor(
    private userService: UserService,
    private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private alertService: ToggleAlertService
  ) { }

  private init() {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const userId = params.get('id');

      if (userId) {
        this.userService.getUserById(userId).pipe(takeUntil(this.destroy$)).subscribe(
          response => {
            if (response) {
              this.user = response.data;

              if ((this.user.primaryRole?.role === UserRole.VISA_REGIONAL_ADMIN) || (this.user.primaryRole?.role === UserRole.VISA_REGIONAL_ADMIN_WITH_PAY_WITH_POINTS)) {
                this.getUserRegions();
              }

              this.additionalBidList = this.user.authorizedBids;
            }
          })
      }
    });
  }

  private getUserRegions() {
    this.userService.getUserRegions().pipe(takeUntil(this.destroy$)).subscribe({
      next: response => {
        this.assignedRegionOptions = response.data.map((region: Region) => {
          return { value: region.regionId, label: region.regionName || EMPTY };
        });
      }
    });
  }

  private manageBidAssignment(bid: string, action: Action) {
    const formData = new FormData();
    const userId = this.user.userId?.toString();

    formData.append("bid", bid);
    formData.append("userId", userId!);
    formData.append("action", action);

    this.userService.manageUserBid(formData).pipe(takeUntil(this.destroy$)).subscribe({
      next: res => {
        if ((res.statusCode === SUCCESS_CODE) && Utils.isNull(res.errors)) {
          this.additionalBidList = res.data?.authorizedBids;

          this.alertService.showSuccessMessage(this.successMessage);
        } else {
          this.alertService.showResponseErrors(res.errors);
        }
      }
    });
  }

  private removeAdditionalBid(bid: string) {
    this.manageBidAssignment(bid, Action.REMOVE_BID);
  }

  private openCommunitiesDialog(data: Bid) {
    this.dialog.open(
      CommunityListComponent,
      {
        hasBackdrop: true,
        disableClose: true,
        ariaLabel: 'community-list-dialog',
        data: {
          bid: data.bid,
          communityLevels: data.communityLevels
        }
      }
    );
  }

  ngOnInit(): void {
    this.init();
  }

  addAdditionalBID() {
    const value = this.assignedBIDForm.get('bid')?.value;

    if (value !== this.user.primaryBid?.bid) {
      this.manageBidAssignment(value, Action.ADD_BID);
    } else {
      this.alertService.showError(PRIMARY_BID_ERROR);
    }
  }

  reset() {
    this.assignedBIDForm.reset();
  }

  isAuthorizedRegion(regionId: string): boolean {
    return this.user.authorizedRegions.some(region => region.regionId === regionId)
  }

  handleRegionAssignment(regionId: string) {
    const formData = new FormData();

    const userId = this.user.userId?.toString();
    const regions = this.user.authorizedRegions.map(region => region.regionId);

    const index = this.user.authorizedRegions
      .findIndex(region => region.regionId === regionId);

    if (index === -1) {
      regions.push(regionId);
    } else {
      regions.splice(index, 1);
    }

    formData.append("userId", userId!);
    formData.append("regions", regions.toString());

    this.initCheckbox = false;

    this.userService.manageRegionAssignment(formData)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: res => {
          if ((res.statusCode === SUCCESS_CODE) && Utils.isNull(res.errors)) {
            this.user.authorizedRegions = res.data?.authorizedRegions;

            this.alertService.showSuccessMessage(this.successMessage);
          } else {
            this.alertService.showResponseErrors(res.errors);
          }
        }
      });

    setTimeout(
      () => {
        this.initCheckbox = true;
      }, 0
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
