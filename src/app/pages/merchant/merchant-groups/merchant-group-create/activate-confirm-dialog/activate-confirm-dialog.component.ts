import { Component, HostListener, Inject, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ButtonColor } from '@visa/vds-angular';
import { SUCCESS_CODE } from 'src/app/core/constants';
import { GarbageCollectorService } from 'src/app/services/garbage-collector.service';
import { HttpService } from 'src/app/services/http/http.service';
import { ToggleAlertService } from 'src/app/services/toggle-alert/toggle-alert.service';
import { Utils } from 'src/app/services/utils';

@Component({
  selector: 'app-activate-confirm-dialog',
  templateUrl: './activate-confirm-dialog.component.html',
  styleUrls: ['./activate-confirm-dialog.component.scss']
})
export class ActivateConfirmDialogComponent implements OnInit, OnDestroy {
  @HostListener("window:keyup.esc")
  onKeyUp(): void {
    this.dialogRef.close();
  }

  ButtonColorEnum = ButtonColor;
  isLoading = false;

  constructor(
    protected dialogRef: MatDialogRef<ActivateConfirmDialogComponent>,
    private readonly httpService: HttpService,
    private readonly alertService: ToggleAlertService,
    private readonly viewContainerRef: ViewContainerRef,
    @Inject(MAT_DIALOG_DATA) private dialogConfig: any
  ) { }

  protected handleSubmit(): void {
    this.isLoading = true;

    this.httpService.post('api/merchantgroup/addMerchantsToGroup', this.dialogConfig).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        res = JSON.parse(res.body);

        if ((res?.statusCode === SUCCESS_CODE) && Utils.isNull(res?.errors)) {
          this.alertService.showSuccessMessage('Merchant successfully updated.');

          this.dialogRef.close({ status: 'activate', res: res });
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

  ngOnInit(): void { }

  ngOnDestroy(): void {
    GarbageCollectorService.clearDetachedDOMElements(
      this,
      this.viewContainerRef
    );
  }
}
