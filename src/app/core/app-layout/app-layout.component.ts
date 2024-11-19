import {
  AfterViewInit,
  Component,
  ContentChildren,
  ElementRef,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { TabsOrientation } from '@visa/vds-angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthorizationService } from 'src/app/services/authorization.service';
import { GarbageCollectorService } from 'src/app/services/garbage-collector.service';
import { NavStatusService } from 'src/app/services/nav-status/nav-status.service';

@Component({
  selector: 'app-app-layout',
  templateUrl: './app-layout.component.html',
  styleUrls: ['./app-layout.component.scss']
})
export class AppLayoutComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('contentEl') contentEl!: ElementRef;
  @ContentChildren('footerActions') fotterAction!: any;

  private destroy$ = new Subject<void>();

  TabsOrientation = TabsOrientation;

  headerHeight: number = 0;
  noteHeight: number = 0;

  isSelected: boolean = false;
  isClientActive: boolean = false;
  isReady: boolean = false;

  navOpen = this.navStatus.isNavigationActive;

  hasFooterAction: boolean = false;

  get isLoggedIn(): boolean {
    return !!this.authService?.readUserSession();
  }

  constructor(
    private navStatus: NavStatusService,
    private viewContainerRef: ViewContainerRef,
    private renderer: Renderer2,
    private authService: AuthorizationService
  ) { }

  ngOnInit(): void {
    this.navStatus.getNavigationStatus().pipe(takeUntil(this.destroy$))
      .subscribe({
        next: navStatus => {
          this.navOpen = navStatus;
        }
      });

    this.navStatus.getHeaderHeight().pipe(takeUntil(this.destroy$))
      .subscribe({
        next: height => {
          this.headerHeight = parseInt(height);
          this.setStyle();
        }
      });

    this.navStatus.getHasFooterActionsObservable().pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        this.setStyle(value ? 50 : 12);
      });

    // this.route.queryParamMap.pipe(takeUntil(this.destroy$))
    //   .subscribe({
    //     next: qp => {
    //       this.isClientActive = !!qp.get('client');
    //       if (this.isClientActive) {
    //         this.noteHeight = 30;
    //       } else {
    //         this.noteHeight = 0;
    //       }
    //       this.setStyle();
    //     }
    //   });

    this.noteHeight = 30;
    this.setStyle();
  }

  ngAfterViewInit(): void {
    this.isReady = true;
    this.setStyle();
  }

  setStyle(footerHeight: number = 0) {
    if (this.isReady) {
      this.renderer.setStyle(
        this.contentEl.nativeElement,
        'margin-top',
        `${this.noteHeight + this.headerHeight}px`
      );
      this.renderer.setStyle(
        this.contentEl.nativeElement,
        'min-height',
        `calc(100vh - 44px - ${this.noteHeight}px - ${this.headerHeight}px - ${footerHeight}px)`
      );
    }
  }

  skipToMain() {
    let scrollToTop = window.scrollY;

    this.contentEl.nativeElement.focus();

    setTimeout(() => {
      window.scrollTo(0, scrollToTop);
    }, 0);
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
