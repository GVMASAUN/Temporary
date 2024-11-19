import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { HistoryDetailsDialogConfig } from './history-details-model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ButtonColor, ButtonIconType } from '@visa/vds-angular';
import { DialogService } from 'src/app/services/dialog/dialog.service';
import { Subject, takeUntil } from 'rxjs';
import { VisaIcon } from 'src/app/core/constants';

@Component({
  selector: 'app-history-details-dialog',
  templateUrl: './history-details-dialog.component.html',
  styleUrls: ['./history-details-dialog.component.scss']
})
export class HistoryDetailsDialogComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  ButtonColor = ButtonColor;
  ButtonIconType = ButtonIconType;
  VisaIcon = VisaIcon;

  constructor(
    private dialogRef: MatDialogRef<HistoryDetailsDialogComponent>,
    private dialogService: DialogService,
    @Inject(MAT_DIALOG_DATA) public dialogConfig: HistoryDetailsDialogConfig
  ) {
    this.dialogService.setDialogEventListeners(
      this.dialogRef,
      () => { this.dialogRef.close(); }
    ).pipe(takeUntil(this.destroy$)).subscribe();
   }

  ngOnInit(): void {
  }

  close() {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
