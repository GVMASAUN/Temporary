import { Component, Inject, OnDestroy, ViewContainerRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ButtonColor } from '@visa/vds-angular';
import { Subject, takeUntil } from 'rxjs';
import { DialogButton, DialogConfig } from 'src/app/core/dialog/dialog.model';
import { DialogService } from 'src/app/services/dialog/dialog.service';
import { GarbageCollectorService } from 'src/app/services/garbage-collector.service';
import { PointsEnquiry, PointsRedeem, PwPCSRTxResult } from '../../pwp-pan-elibility.model';

@Component({
  selector: 'app-pwp-transaction-details-dialog',
  templateUrl: './pwp-transaction-details-dialog.component.html',
  styleUrls: ['./pwp-transaction-details-dialog.component.scss']
})
export class PwpTransactionDetailsDialogComponent implements OnDestroy {
  transactionDetails!: PwPCSRTxResult;

  get pointsDetails(): PointsEnquiry {
    return this.transactionDetails?.pointsEnquiry || {};
  }

  get pointsRedeemDetails(): PointsRedeem {
    return this.transactionDetails?.pointsRedeem?.[0] || {};
  }

  constructor(
    private dialogService: DialogService,
    private viewContainerRef: ViewContainerRef,
    protected dialogRef: MatDialogRef<PwpTransactionDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) protected dialogConfig: DialogConfig<PwPCSRTxResult>
  ) {
    this.dialogService.setDialogEventListeners(this.dialogRef)
      .pipe(takeUntil(this.destroy$)).subscribe();

    this.transactionDetails = dialogConfig.data!;
  }

  private destroy$ = new Subject<void>();

  protected dialogActions: DialogButton[] = [
    {
      label: 'Close',
      color: ButtonColor.SECONDARY,
      click: () => this.dialogRef.close()
    }
  ];

  ngOnDestroy(): void {
    console.log(this.dialogConfig);

    this.destroy$.next();
    this.destroy$.complete();

    GarbageCollectorService.clearDetachedDOMElements(
      this,
      this.viewContainerRef
    );
  }
}
