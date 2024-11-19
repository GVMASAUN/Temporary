import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EMPTY } from 'src/app/core/constants';
import { GarbageCollectorService } from 'src/app/services/garbage-collector.service';
import { NavStatusService } from 'src/app/services/nav-status/nav-status.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  @ViewChild('headerWrapper')
  headerWrapper!: ElementRef;

  @Input()
  screenTitle: string = EMPTY;

  @Input()
  headerHeight: number = 46;

  private destroy$ = new Subject<void>();

  navOpen: boolean = this.navStatus.isNavigationActive;
  isClientActive: boolean = false;

  get headerStyles(): { [key: string]: string } {
    return {
      height: this.headerHeight + 'px',
      top: '30px'
    };
  }

  constructor(
    private navStatus: NavStatusService,
    private route: ActivatedRoute,
    private viewContainerRef: ViewContainerRef
  ) {
    this.navStatus.getNavigationStatus().pipe(takeUntil(this.destroy$))
      .subscribe({
        next: status => {
          this.navOpen = status;
        }
      });

    this.route.queryParamMap.pipe(takeUntil(this.destroy$))
      .subscribe(qp => {
        this.isClientActive = !!qp.get('client');
      });

  }

  ngOnInit(): void {
    this.navStatus.setHeaderHeight(this.headerHeight.toString());
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
