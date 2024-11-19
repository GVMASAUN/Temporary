import { Component, ContentChild, EventEmitter, Input, OnDestroy, OnInit, Output, TemplateRef, ViewContainerRef } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { VisaIcon } from 'src/app/core/constants';
import { GarbageCollectorService } from 'src/app/services/garbage-collector.service';
import { NavStatusService } from 'src/app/services/nav-status/nav-status.service';
import { PanelAction, PanelTab } from './panel.model';
import { ButtonColor, ButtonIconType, TabsOrientation } from '@visa/vds-angular';

@Component({
  selector: 'app-panel',
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.scss']
})
export class PanelComponent implements OnInit, OnDestroy {
  @Input()
  panelId: string = 'app-panel';

  @Input()
  selectedTab: number = 0;

  @Input()
  panelTabs: PanelTab[] = [];

  @Input()
  panelActions: PanelAction[] = [];

  @Output() activeSection = new EventEmitter<number>();

  @Output() panelStatusEmitter = new EventEmitter<boolean>();

  @ContentChild("tabContent")
  tabContent!: TemplateRef<any>;

  private destroy$ = new Subject<void>();

  ButtonColor = ButtonColor;
  TabsOrientation = TabsOrientation;
  ButtonIconType = ButtonIconType;
  VisaIcon = VisaIcon;

  isPanelOpen: boolean = this.status.isPanelActive;

  constructor(
    private status: NavStatusService,
    private viewContainerRef: ViewContainerRef,
  ) { }

  ngOnInit(): void {
    this.status.getPanelStatus.pipe(takeUntil(this.destroy$)).subscribe({
      next: panelStatus => {
        this.isPanelOpen = panelStatus;
      }
    });
  }

  sendOutput() {
    this.activeSection.emit(this.selectedTab);
  }

  closePanel() {
    const prevNavStatus = this.status.getPreviousNavigationStatus();

    this.status.togglePanel(false);
    this.status.toggleNavigation(prevNavStatus);
    this.panelStatusEmitter.emit(false);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    GarbageCollectorService.clearDetachedDOMElements(
      this,
      this.viewContainerRef,
      true
    );
  }
}
