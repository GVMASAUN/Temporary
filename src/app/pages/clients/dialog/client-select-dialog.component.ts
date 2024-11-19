import { Component, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ButtonColor, ButtonIconType } from '@visa/vds-angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DialogService } from 'src/app/services/dialog/dialog.service';
import { GarbageCollectorService } from 'src/app/services/garbage-collector.service';
import { NavStatusService } from 'src/app/services/nav-status/nav-status.service';

@Component({
  selector: 'app-client-select-dialog',
  templateUrl: './client-select-dialog.component.html',
  styleUrls: ['./client-select-dialog.component.scss']
})
export class ClientSelectDialogComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  ButtonIconType = ButtonIconType;
  ButtonColor = ButtonColor;

  isPanelOpen: boolean = false;

  constructor(
    private dialogRef: MatDialogRef<ClientSelectDialogComponent>,
    private navStatus: NavStatusService,
    private dialogService: DialogService,
    private viewContainerRef: ViewContainerRef
  ) {
    this.navStatus.getPanelStatus.pipe(takeUntil(this.destroy$))
      .subscribe({
        next: panelStatus => {
          this.isPanelOpen = panelStatus;
        }
      });

    this.dialogService.setDialogEventListeners(
      this.dialogRef,
      () => { this.close(); }
    ).pipe(takeUntil(this.destroy$)).subscribe();
  }

  ngOnInit(): void {
  }

  close(): void {
    // Added a timeout to handle the "enter" event bug for VGAR requirement. 
    // On closing the "enter" event, it was causing an open dialog after close; hence, a timeout was added.

    setTimeout(() => {
      this.dialogRef.close();
    }, 150);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    GarbageCollectorService.clearDetachedDOMElements(
      this,
      this.viewContainerRef
    );
  }
}
