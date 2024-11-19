import { Component, HostListener, Inject, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AlertType, ButtonColor } from '@visa/vds-angular';
import { EMPTY, SUCCESS_CODE } from 'src/app/core/constants';
import { GarbageCollectorService } from 'src/app/services/garbage-collector.service';
import { HttpService } from 'src/app/services/http/http.service';
import { ToggleAlertService } from 'src/app/services/toggle-alert/toggle-alert.service';
import { Utils } from 'src/app/services/utils';

@Component({
  selector: 'app-add-merchant-confirm-dialog',
  templateUrl: './add-merchant-confirm-dialog.component.html',
  styleUrls: ['./add-merchant-confirm-dialog.component.scss']
})
export class AddMerchantConfirmDialogComponent implements OnInit, OnDestroy {
  ButtonColor = ButtonColor;

  formData!: FormData;
  merchantData: any;

  errMsg: string = EMPTY;
  type: string = EMPTY;

  showLoader: boolean = false;

  @HostListener("window:keyup.esc")
  onKeyUp(): void {
    this.close();
  }

  constructor(
    private dialogRef: MatDialogRef<AddMerchantConfirmDialogComponent>,
    private http: HttpService,
    private router: Router,
    private viewContainerRef: ViewContainerRef,
    private alertService: ToggleAlertService,
    @Inject(MAT_DIALOG_DATA) private dialogConfig: any
  ) { }

  private mapDialogConfigData() {
    const dialogData = this.dialogConfig;

    this.type = dialogData?.type;
    this.formData = dialogData?.formData;
    this.merchantData = dialogData?.merchantData;
  }

  private uploadFile() {
    this.showLoader = true;

    const route
      = this.type === 'file'
        ? 'add-bin-caid'
        : 'add-vmid-vsid'

    const queryParam
      = this.type === 'file'
        ? 'AcquirerInfo'
        : 'MerchantInfo'

    const path = decodeURIComponent(this.router.url.split(route)[0].slice(0, -1));

    this.http
      .post(`api/merchantgroup/addMerchantsToGroupByFile`, this.formData)
      .subscribe({
        next: (res: any) => {
          this.showLoader = false;
          res = JSON.parse(res.body);

          if ((res.statusCode === SUCCESS_CODE) && Utils.isNull(res.errors)) {
            this.dialogRef.close({ isCancel: false });

            this.router
              .navigate(
                [path],
                {
                  queryParams: { type: queryParam },
                  queryParamsHandling: 'merge'
                }
              )
              .then(() =>
                this.alertService.setAlertData({
                  title: `Success`,
                  message: res?.data?.responseStatus?.message,
                  type: AlertType.SUCCESS
                })
              );
          } else {
            this.alertService.showResponseErrors(res?.errors);
            this.formData.delete('merchantGroupName');
            this.formData.delete('merchantGroupType');
            this.formData.delete('communityCode');

            this.dialogRef.close({ fileUploadSuccess: false });
          }
        },
        error: err => {
          this.dialogRef.close({ fileUploadSuccess: false });

          this.showLoader = false;
          this.errMsg = err?.error;
          console.log(err);
          this.formData.delete('merchantGroupName');
          this.formData.delete('merchantGroupType');
          this.formData.delete('communityCode');
        }
      });
  }

  private uploadCombinations() {
    this.showLoader = true;

    const route
      = this.type === 'combinations'
        ? 'add-bin-caid'
        : 'add-vmid-vsid'

    const queryParam
      = this.type === 'combinations'
        ? 'AcquirerInfo'
        : 'MerchantInfo'

    const path = decodeURIComponent(this.router.url.split(route)[0].slice(0, -1));

    this.http
      .post(`api/merchantgroup/addMerchantsToGroupByBulkForm`, this.formData)
      .subscribe({
        next: (res: any) => {
          this.showLoader = false;
          res = JSON.parse(res.body);
          if ((res.statusCode === SUCCESS_CODE) && Utils.isNull(res.errors)) {
            this.dialogRef.close({ isCancel: false });

            this.router
              .navigate(
                [path],
                {
                  queryParams: { type: queryParam },
                  queryParamsHandling: 'merge'
                }
              )
              .then(() =>
                this.alertService.setAlertData({
                  title: `Success`,
                  message: res?.data?.responseStatus?.message,
                  type: AlertType.SUCCESS
                })
              );
          } else {
            this.alertService.showResponseErrors(res?.errors, true);

            this.formData.delete('merchantGroupName');
            this.formData.delete('merchantGroupType');
            this.formData.delete('communityCode');
            this.formData.delete('merchants');

            this.dialogRef.close();
          }
        },
        error: err => {
          this.showLoader = false;
          this.errMsg = err?.error;

          console.log(err);
          this.formData.delete('merchantGroupName');
          this.formData.delete('merchantGroupType');
          this.formData.delete('communityCode');
          this.formData.delete('merchants');
          
          this.dialogRef.close();
        }
      });
  }

  private addMerchantToGroup() {
    this.showLoader = true;

    const route
      = this.type === 'bin-caid'
        ? 'add-bin-caid'
        : 'add-vmid-vsid'

    const queryParam
      = this.type === 'bin-caid'
        ? 'AcquirerInfo'
        : 'MerchantInfo'

    const path = decodeURIComponent(this.router.url.split(route)[0].slice(0, -1));

    this.http
      .post(`api/merchantgroup/addMerchantsToGroup`, this.merchantData)
      .subscribe({
        next: (res: any) => {
          this.showLoader = false;

          res = JSON.parse(res.body);
          if ((res.statusCode === SUCCESS_CODE) && Utils.isNull(res.errors)) {
            this.dialogRef.close({ isCancel: false });

            this.router
              .navigate(
                [path],
                {
                  queryParams: { type: queryParam },
                  queryParamsHandling: 'merge'
                })
              .then(() => this.alertService.showSuccessMessage(`Merchants added successfully.`));
          } else {
            this.alertService.showResponseErrors(res?.errors, true);
            this.close();
          }
        },
        error: err => {
          this.showLoader = false;
          console.log(err);
        }
      });
  }

  ngOnInit(): void {
    this.mapDialogConfigData();
  }

  confirm() {
    switch (this.type) {
      case 'file':
      case 'vmid-file':
        this.uploadFile();
        break;
      case 'combinations':
      case 'vmid-combinations':
        this.uploadCombinations();
        break;
      case 'bin-caid':
      case 'vmid-find-merchant':
        this.addMerchantToGroup();
        break;
      default:
        break;
    }
  }

  close() {
    this.dialogRef.close({ isCancel: true });
  }

  ngOnDestroy(): void {
    GarbageCollectorService.clearDetachedDOMElements(
      this,
      this.viewContainerRef
    );
  }
}
