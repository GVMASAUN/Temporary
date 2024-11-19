import { Component, HostListener, Inject, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ButtonColor } from '@visa/vds-angular';
import { EMPTY } from 'src/app/core/constants';
import { GarbageCollectorService } from 'src/app/services/garbage-collector.service';
import { HttpService } from 'src/app/services/http/http.service';
import { ToggleAlertService } from 'src/app/services/toggle-alert/toggle-alert.service';

@Component({
  selector: 'app-archive-dialog',
  templateUrl: './archive-dialog.component.html',
  styleUrls: ['./archive-dialog.component.scss']
})
export class ArchiveDialogComponent implements OnInit, OnDestroy {
  ButtonColor = ButtonColor;

  @HostListener("window:keyup.esc")
  onKeyUp(): void {
    this.dialogRef.close({ action: 'close' });
  }

  constructor(
    public dialogRef: MatDialogRef<ArchiveDialogComponent>,
    private http: HttpService,
    private viewContainerRef: ViewContainerRef,
    private alertService: ToggleAlertService,
    @Inject(MAT_DIALOG_DATA) private dialogConfig: any
  ) { }

  errorMsg: string = EMPTY;

  isLoading: boolean = false;

  groupData = this.dialogConfig;
  data = {
    communityCode: this.groupData.communityCode,
    merchantGroups: [
      {
        name: this.groupData.groupName
      }
    ],
    type: this.dialogConfig.type,
    deleteAllMerchants: true
  };

  ngOnInit(): void { }

  handleSubmit() {
    this.errorMsg = EMPTY;
    this.isLoading = true;

    this.http
      .post('api/merchantgroup/inactivateMerchantGroup', this.data)
      .subscribe({
        next: (res: any) => {
          res = JSON.parse(res.body);
          this.isLoading = false;

          if (res.success) {
            this.dialogRef.close({ action: 'archived' });

            this.alertService.showSuccessMessage('Merchant Group updated successfully.');
          } else {
            this.alertService.showResponseErrors(res.errors);
          }
        },
        error: err => {
          this.isLoading = false;
          this.errorMsg = JSON.parse(err.error).message;

          // this.alertService.showError(this.errorMsg);
        }
      });
  }

  ngOnDestroy(): void {
    GarbageCollectorService.clearDetachedDOMElements(
      this,
      this.viewContainerRef
    );
  }
}
