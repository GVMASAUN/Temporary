import { Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { AlertPosition, AlertSideNav, AlertType, ButtonIconType } from '@visa/vds-angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { STRING, VisaIcon } from 'src/app/core/constants';
import { ButtonDirection } from 'src/app/core/models/dialog-button-direction.model';
import { GarbageCollectorService } from 'src/app/services/garbage-collector.service';
import { NavStatusService } from 'src/app/services/nav-status/nav-status.service';
import { ToggleAlertService } from 'src/app/services/toggle-alert/toggle-alert.service';
import { AlertConfig, AlertIcon, AlertMode } from './alert-box.model';

@Component({
  selector: 'app-alert-box',
  templateUrl: './alert-box.component.html',
  styleUrls: ['./alert-box.component.scss']
})
export class AlertBoxComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  ButtonIconType = ButtonIconType;
  AlertType = AlertType.SUCCESS;
  AlertPosition = AlertPosition;
  AlertSideNav = AlertSideNav;
  AlertMode = AlertMode;
  VisaIcon = VisaIcon;
  ButtonDirection = ButtonDirection;
  AlertIcon = AlertIcon;

  alertConfig!: AlertConfig;

  globalAlertShown: boolean = false;

  isSideNavOpen = this.navStatusService.isNavigationActive;

  private lastFocusedElement: HTMLElement | null = null;

  @ViewChild('closeButton', { static: false, read: ElementRef }) closeButton!: ElementRef<HTMLButtonElement>;

  constructor(
    private toggleAlertService: ToggleAlertService,
    private navStatusService: NavStatusService,
    private viewContainerRef: ViewContainerRef
  ) {
    this.toggleAlertService.getAlertData().pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          document.querySelector('app-root')?.removeAttribute('aria-hidden');

          if (data) {
            this.alertConfig = data;
            this.globalAlertShown = true;
            this.lastFocusedElement = document.activeElement as HTMLElement;

            setTimeout(() => {
              if (!!this.closeButton.nativeElement) {
                this.closeButton.nativeElement?.focus();
              }
            }, 0);

            if (this.alertConfig.type == AlertType.SUCCESS) {
              setTimeout(() => {
                this.closeAlert();
              }, 4000);
            }

            if (this.alertConfig.type) {
              this.AlertType = this.alertConfig.type;
            }
          }
        }
      });

    this.navStatusService.getNavigationStatus().pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any) => {
        this.isSideNavOpen = data;
      }
    });
  }

  ngOnInit(): void { }

  isString(value: any): value is string {
    return typeof value === STRING;
  }

  isArray(value: any): value is string[] {
    return Array.isArray(value);
  }

  closeAlert(): void {
    this.globalAlertShown = false;

    if (this.lastFocusedElement) {
      setTimeout(() => {
        this.lastFocusedElement?.focus();
      }, 0);
    }
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
