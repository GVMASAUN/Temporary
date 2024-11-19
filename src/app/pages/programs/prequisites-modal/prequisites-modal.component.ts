import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { DialogService } from 'src/app/services/dialog/dialog.service';

@Component({
  selector: 'app-prequisites-modal',
  templateUrl: './prequisites-modal.component.html',
  styleUrls: ['./prequisites-modal.component.scss']
})
export class PrequisitesModalComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  setupData: any[] = [];

  constructor(
    private dialogService: DialogService,
    @Inject(MAT_DIALOG_DATA) private dialogConfig: any,
    private dialogRef: MatDialogRef<PrequisitesModalComponent>
  ) {
    this.dialogService.setDialogEventListeners(
      this.dialogRef,
      () => { this.close(); }
    ).pipe(takeUntil(this.destroy$)).subscribe();
  }

  ngOnInit(): void {
    this.setupData = this.dialogConfig;
  }

  close() {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
