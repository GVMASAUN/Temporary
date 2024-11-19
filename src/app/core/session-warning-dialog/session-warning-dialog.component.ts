import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ButtonColor, ButtonIconType } from '@visa/vds-angular';
import { AuthorizationService } from 'src/app/services/authorization.service';
import { LogoutService } from 'src/app/services/logout/logout.service';
import { VisaIcon } from '../constants';
import { DialogService } from 'src/app/services/dialog/dialog.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-session-warning-dialog',
  templateUrl: './session-warning-dialog.component.html',
  styleUrls: ['./session-warning-dialog.component.scss']
})
export class SessionWarningDialogComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  ButtonColor = ButtonColor;
  ButtonIconType = ButtonIconType;
  VisaIcon = VisaIcon;

  constructor(
    private logoutService: LogoutService,
    private authService: AuthorizationService,
    private dialogService: DialogService,
    private dialogRef: MatDialogRef<SessionWarningDialogComponent>
  ) {
    this.dialogService.setDialogEventListeners(
      this.dialogRef,
      () => { this.close(); }
    ).pipe(takeUntil(this.destroy$)).subscribe();
   }

  ngOnInit(): void {
  }

  continue() {
    this.dialogRef.close();
    this.authService.validateSession().subscribe();
  }

  close() {
    this.dialogRef.close();
    this.logoutService.logout();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
