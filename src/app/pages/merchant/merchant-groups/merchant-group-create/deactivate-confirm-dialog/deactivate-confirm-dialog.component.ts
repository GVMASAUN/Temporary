import { Component, HostListener, Inject, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ButtonColor } from '@visa/vds-angular';
import { SUCCESS_CODE } from 'src/app/core/constants';
import { GarbageCollectorService } from 'src/app/services/garbage-collector.service';
import { HttpService } from 'src/app/services/http/http.service';
import { ToggleAlertService } from 'src/app/services/toggle-alert/toggle-alert.service';
import { Utils } from 'src/app/services/utils';

@Component({
  selector: 'app-deactivate-confirm-dialog',
  templateUrl: './deactivate-confirm-dialog.component.html',
  styleUrls: ['./deactivate-confirm-dialog.component.scss']
})
export class DeactivateConfirmDialogComponent implements OnInit, OnDestroy {
  @HostListener("window:keyup.esc")
  onKeyUp(): void {
    this.dialogRef.close();
  }

  ButtonColorEnum = ButtonColor;

  isLoading: boolean = false;


  constructor(
    public dialogRef: MatDialogRef<DeactivateConfirmDialogComponent>,
    private http: HttpService,
    private viewContainerRef: ViewContainerRef,
    private alertService: ToggleAlertService,
    @Inject(MAT_DIALOG_DATA) private dialogConfig: any
  ) { }

  ngOnInit(): void { }

  handleSubmit() {
    this.isLoading = true;
    let payload = this.dialogConfig;

    this.http
      .post('api/merchantgroup/removeMerchantsFromGroup', payload)
      .subscribe({
        next: (res: any) => {
          this.isLoading = false;
          res = JSON.parse(res.body);
          if ((res?.statusCode === SUCCESS_CODE) && Utils.isNull(res?.errors)) {
            this.alertService.showSuccessMessage('Merchant successfully updated.');

            this.dialogRef.close({ status: 'deactivate', res: res });
          } else {
            this.alertService.showResponseErrors(res?.errors);
            this.dialogRef.close();
          }
        },
        error: err => {
          this.isLoading = false;
          console.log(err);
          this.dialogRef.close();
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
