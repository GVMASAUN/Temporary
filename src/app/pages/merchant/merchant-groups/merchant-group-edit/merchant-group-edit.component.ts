import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { BadgeType, ButtonColor } from '@visa/vds-angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EMPTY } from 'src/app/core/constants';
import { NavStatusService } from 'src/app/services/nav-status/nav-status.service';

@Component({
  selector: 'app-merchant-group-edit',
  templateUrl: './merchant-group-edit.component.html',
  styleUrls: ['./merchant-group-edit.component.scss']
})
export class MerchantGroupEditComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  ButtonColor = ButtonColor;
  BadgeType = BadgeType;

  listBadgeType: any[] = [];

  activeTab: string = EMPTY;
  groupName: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private status: NavStatusService
  ) {
    this.groupName = this.route.snapshot.params['id'];

    this.router.events.pipe(takeUntil(this.destroy$))
      .subscribe((event: any) => {
        if (event instanceof NavigationEnd) {
          this.activeTab =
            event.urlAfterRedirects
              .split('/')
              .pop()
              ?.split('?')
              .shift() || EMPTY;

          this.listBadgeType[0] =
            this.activeTab == 'basics' ? BadgeType.NEUTRAL : BadgeType.STATUS;
          this.listBadgeType[1] =
            this.activeTab == 'merchants' ? BadgeType.NEUTRAL : BadgeType.STATUS;
        }
      });
  }

  ngOnInit(): void {
    this.status.setOverlayStatus(true);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    this.status.setOverlayStatus(false);
  }
}
