import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ButtonIconType, TooltipPosition } from '@visa/vds-angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { GarbageCollectorService } from 'src/app/services/garbage-collector.service';
import { NavStatusService } from 'src/app/services/nav-status/nav-status.service';
import { versions } from 'src/environments/versions';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('footerAction') footerAction!: ElementRef;

  @Input()
  breadcrumb: any[] = [];

  @Input()
  overlay: boolean = false;

  @Input()
  rowSelected: boolean = false;

  @Input()
  panelOpen: boolean = false;

  private destroy$ = new Subject<void>();

  ButtonIconType = ButtonIconType;
  TooltipPosition = TooltipPosition;

  revision: string = versions.revision;
  date: string = versions.date;

  footerOpen: boolean = false;
  navOpen: boolean = this.navStatusService.isNavigationActive;
  currentYear: number = (new Date).getFullYear();

  constructor(
    private navStatusService: NavStatusService,
    private viewContainerRef: ViewContainerRef
  ) {
    this.navStatusService.getNavigationStatus().pipe(takeUntil(this.destroy$))
      .subscribe({
        next: status => {
          this.navOpen = status;
        }
      });
  }
  ngAfterViewInit(): void {
    if (this.footerAction?.nativeElement?.innerHTML?.length > 0) {
      this.navStatusService.setHasFooterActions(true);
    } else {
      this.navStatusService.setHasFooterActions(false);
    }
  }

  ngOnInit(): void { }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    GarbageCollectorService.clearDetachedDOMElements(
      this,
      this.viewContainerRef
    );
  }
}
