import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ButtonIconType, TooltipPosition } from '@visa/vds-angular';
import { Subject, takeUntil } from 'rxjs';
import { EMPTY } from 'src/app/core/constants';
import { NavStatusService } from 'src/app/services/nav-status/nav-status.service';

@Component({
  selector: 'app-overlay',
  templateUrl: './overlay.component.html',
  styleUrls: ['./overlay.component.scss']
})
export class OverlayComponent implements OnInit, OnDestroy {
  @Input()
  backLink: string[] = [];

  @Input()
  backQueryParams: any;

  @Input()
  screenTitle: string = EMPTY;

  @Input()
  backPage: string = EMPTY;

  @Input()
  close: boolean = false;

  TooltipPosition = TooltipPosition;
  ButtonIconType = ButtonIconType;
  private destroy$ = new Subject<void>();
  footerHasAction = false;

  constructor(
    private navStatusService: NavStatusService
  ) { }

  ngOnInit(): void {
    this.navStatusService.getHasFooterActionsObservable()
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        this.footerHasAction = value;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
