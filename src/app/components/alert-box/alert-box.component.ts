import { Component, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import {
  ButtonIconType,
  AlertType,
  AlertPosition,
  AlertSideNav,
  AlertTopNav
} from '@visa/vds-angular';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EMPTY } from 'src/app/core/constants';
import { GarbageCollectorService } from 'src/app/services/garbage-collector.service';
import { NavStatusService } from 'src/app/services/nav-status/nav-status.service';
import {
  ToggleAlertService,
  AlertConfig
} from 'src/app/services/toggle-alert/toggle-alert.service';

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
  AlertTopNav = AlertTopNav;

  subscription: Subscription = new Subscription();

  alertData!: AlertConfig
  globalAlertShown: boolean = false;
  isSideNavOpen = this.navStatusService.isNavigationActive;


  constructor(
    private toggleAlertService: ToggleAlertService,
    private navStatusService: NavStatusService,
    private viewContainerRef: ViewContainerRef,
    private router: Router
  ) {
    this.toggleAlertService.getAlertData().pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {

          this.alertData = data;
          this.globalAlertShown = true;

          if (this.alertData.type == AlertType.SUCCESS) {
            setTimeout(() => {
              this.closeAlert();
            }, 4000);
          }

          if (this.alertData.type) {
            this.AlertType = this.alertData.type;
          }

          // this.router.events.pipe(takeUntil(this.destroy$))
          //   .subscribe(val => {
          //     if (val instanceof NavigationEnd) {
          //       this.closeAlert();
          //     }
          //   });
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
    return typeof value === 'string';
  }

  isArray(value: any): value is string[] {
    return Array.isArray(value);
  }

  isStringOrArray(value: any): boolean {
    return this.isString(value) || this.isArray(value);
  }

  closeAlert() {
    this.globalAlertShown = false;
  }

  ngOnDestroy() {

    this.destroy$.next();
    this.destroy$.complete();
    GarbageCollectorService.clearDetachedDOMElements(
      this,
      this.viewContainerRef
    );
  }
}
