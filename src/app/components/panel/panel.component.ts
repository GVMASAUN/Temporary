import {
  Component,
  ContentChild,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  TemplateRef,
  ViewContainerRef
} from '@angular/core';
import {
  ButtonColor,
  ButtonIconType,
  TabsOrientation
} from '@visa/vds-angular';
import { UntypedFormBuilder } from '@angular/forms';
import { NavStatusService } from 'src/app/services/nav-status/nav-status.service';
import { PanelAction, PanelTab } from './panel.model';
import { Subject } from 'rxjs';
import { GarbageCollectorService } from 'src/app/services/garbage-collector.service';
import { EMPTY } from 'src/app/core/constants';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-panel',
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.scss']
})
export class PanelComponent implements OnInit, OnDestroy {
  @Input()
  panelTabs: PanelTab[] = [];

  @Input()
  panelActions: PanelAction[] = [];

  @Input()
  forProgram: boolean = false;

  @Input()
  closeIcon: string = 'visa_arrow_end';

  @Input()
  selectedTab: number = 0;

  // Temporary change
  @Input()
  hideFilter = false;

  @Output() activeSection = new EventEmitter<number>();

  @Output() panelStatusEmitter = new EventEmitter<boolean>();

  @ContentChild("tabContent")
  tabContent!: TemplateRef<any>;

  private destroy$ = new Subject<void>();

  ButtonColor = ButtonColor;
  TabsOrientation = TabsOrientation;
  ButtonIconType = ButtonIconType;

  isPanelOpen = this.status.isPanelActive;

  constructor(
    private status: NavStatusService,
    private formBuilder: UntypedFormBuilder,
    private viewContainerRef: ViewContainerRef,
  ) { }

  showPanel: boolean = false;

  searchData = this.formBuilder.group({
    groupName: EMPTY,
    groupType: EMPTY,
    client: EMPTY,
    status: EMPTY,
    sDate: EMPTY,
    eDate: EMPTY
  });

  filterData = this.formBuilder.group({
    user: EMPTY,
    entity: EMPTY,
    activity: EMPTY,
    date: EMPTY
  });

  filterDate = [
    'Today',
    'Yesterday',
    'Last 7 days',
    'Last 30 days',
    'Last 3 months',
    'Last 12 months',
    'Custome range...'
  ];

  ngOnInit(): void {
    this.status.getPanelStatus.pipe(takeUntil(this.destroy$))
      .subscribe({
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
