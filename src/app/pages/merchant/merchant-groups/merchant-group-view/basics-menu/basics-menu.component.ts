import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { BadgeType, ButtonColor } from '@visa/vds-angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EMPTY, VisaIcon } from 'src/app/core/constants';
import { PaginationResponse, ResponseError } from 'src/app/core/models/pagination-response.model';
import { HttpService } from 'src/app/services/http/http.service';
import { MerchantGroupService } from 'src/app/services/merhant-group/merchant-group.service';
import { NavStatusService } from 'src/app/services/nav-status/nav-status.service';
import { TableDataCountService } from 'src/app/services/private/table-data-count.service';
import { ToggleAlertService } from 'src/app/services/toggle-alert/toggle-alert.service';
import { Utils } from 'src/app/services/utils';
import { ArchiveDialogComponent } from './archive-dialog/archive-dialog.component';
import { CloneDialogComponent } from './clone-dialog/clone-dialog.component';

@Component({
  selector: 'app-basics-menu',
  templateUrl: './basics-menu.component.html',
  styleUrls: ['./basics-menu.component.scss']
})
export class BasicsMenuComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  BadgeType = BadgeType;
  ButtonColor = ButtonColor;
  VisaIcon = VisaIcon;

  merchantStatus: boolean = false;
  DataChange: boolean = false;
  initView: boolean = false;

  merchantId: string = EMPTY;

  oldData = {
    description: EMPTY
    // merchantStatus: ''
  };
  merchantData = this.fb.group({
    description: EMPTY
    // merchantStatus: ''
  });

  date = Date.now();

  merchantType = this.route.snapshot.queryParams['type'];
  merchantName = this.route.snapshot.params['id'];

  constructor(
    private dataPool: TableDataCountService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: UntypedFormBuilder,
    private alertService: ToggleAlertService,
    private dialog: MatDialog,
    private http: HttpService,
    private navStatusService: NavStatusService,
    private merchantGroupService: MerchantGroupService
  ) { }

  private setErrorMessages(responseErrors: ResponseError[]) {
    this.alertService.showResponseErrors(responseErrors);

    this.merchantGroupService.updateErrorMessages(responseErrors, this.merchantData);
  }

  private getMerchantData() {
    this.dataPool.getMerchantData()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: res => {
          if (res?.data) {            
            this.merchantName = res.data.name;
            this.merchantType = res.data.merchantGroupType;
            this.merchantStatus = res.data.isActive;
            this.merchantId = res.data.id;

            this.oldData.description = res.data.merchantGroupDescription;
            this.merchantData.patchValue(this.oldData);

            this.initView = true;
          }
        }
      });
  }

  ngOnInit(): void {
    this.merchantData.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: res => {
          this.DataChange = !(
            this.oldData.description == this.getFormValue('description')
          );
        }
      });

    this.getMerchantData();
    this.navStatusService.setOverlayStatus(true);
  }

  // getMerchantGroupData(name: string) {
  //   let param = {
  //     merchantGroupName: name,
  //     communityCode: this.route.snapshot.queryParams['client']
  //   };

  //   this.http.get('api/merchantgroup/viewMerchantGroup', param).subscribe({
  //     next: (res: any) => {
  //       res = JSON.parse(res.body);
  //       localStorage.setItem('merchant-details', JSON.stringify(res.data));
  //       this.dataPool.setMerchantData(res);
  //       this.dataPool.refreshRequest.next('');
  //     },
  //     error: err => {
  //       console.log(err);
  //     }
  //   });
  // }

  getFormValue(keyName: 'description') {
    return this.merchantData.get(keyName)?.value;
  }
  setFormValue(keyName: 'description', data: any) {
    this.merchantData.get(keyName)?.setValue(data);
  }

  // checkChange() {
  //   setTimeout(() => {
  //     console.log(
  //       this.getFormValue('description'),
  //       this.getFormValue('merchantStatus')
  //     );

  //     this.DataChange = !(
  //       this.oldData.description == this.getFormValue('description') &&
  //       this.oldData.merchantStatus == this.getFormValue('merchantStatus')
  //     );
  //   }, 0);
  //   console.log(this.oldData);
  // }

  saveGroup() {
    const payload = {
      communityCode: this.route.snapshot.queryParams['client'],
      merchantGroupName: this.merchantName,
      merchantGroupId: this.merchantId,
      merchantGroupDescription: this.getFormValue('description')
    };

    this.http
      .post('api/merchantgroup/updateMerchantGroupBasics', payload)
      .subscribe({
        next: res => {
          const paginationResponse = JSON.parse(res.body!) as PaginationResponse<any>;

          if (Utils.isNotNull(paginationResponse.errors)) {
            this.setErrorMessages(paginationResponse.errors);
          } else {
            this.alertService.showSuccessMessage('Merchant Group updated successfully.');
          }
          console.log(res);
        },
        error: err => {
          console.log(err);
        }
      });
  }

  private handleDialogResponse(response: any) {
    if (response) {
      if (response.action === 'clone' && response.data) {
        this.router
          .navigate(['merchant', 'view', response.name, 'basics'], {
            queryParams: { type: this.merchantType },
            queryParamsHandling: 'merge'
          })
          .then(() => {
            this.merchantName = response.name;
            this.dataPool.setMerchantData(response.data);

            this.getMerchantData();
          });
      }
      else if (response.action === 'archived') {
        this.dataPool.refreshRequest.next('merchant');
      }
    }
  }

  cloneGroup() {
    this.dialog.open(
      CloneDialogComponent,
      {
        width: '720px',
        hasBackdrop: true, disableClose: true,
        ariaLabel: 'clone-dialog',
        data: {
          type: this.merchantType,
          groupName: this.merchantName,
          optionalComment: EMPTY,
          id: this.merchantId
        }
      }).afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => this.handleDialogResponse(result));
  }

  archiveGroup() {
    this.dialog.open(
      ArchiveDialogComponent,
      {
        hasBackdrop: true, disableClose: true,
        ariaLabel: 'archive-dialog',
        data: {
          type: this.merchantType,
          groupName: this.merchantName,
          communityCode: this.route.snapshot.queryParams['client']
        }
      }).afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => this.handleDialogResponse(result));
  }

  backAction() {
    if (this.DataChange) {
      this.setFormValue('description', this.oldData.description);
      this.DataChange = false;
    } else {
      this.router.navigate(['merchant'], {
        queryParamsHandling: 'merge',
        queryParams: { type: null }
      });
    }
  }

  getErrorMessage(controlName: string): string {
    return this.merchantGroupService.getErrorMessage(this.merchantData, controlName);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
