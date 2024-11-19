import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BadgeType } from '@visa/vds-angular';
import { NavStatusService } from 'src/app/services/nav-status/nav-status.service';

@Component({
  selector: 'app-new-program',
  templateUrl: './new-program.component.html',
  styleUrls: ['./new-program.component.scss']
})
export class NewProgramComponent implements OnInit, OnDestroy {
  badgeType = BadgeType;
  subscriber: any[] = [];

  constructor(
    private status: NavStatusService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    let routerSubscriber = this.route.firstChild?.url.subscribe({
      next: res => {
        this.basicsTabActive = res.pop()?.path == 'basics';
      }
    });

    this.subscriber.push(routerSubscriber);
  }

  basicsTabActive = true;

  ngOnInit(): void {
    this.status.setOverlayStatus(true);
  }
  ngOnDestroy(): void {
    this.status.setOverlayStatus(false);

    this.subscriber.map(sub => {
      sub.unsubscribe();
    });
  }

  selectTab(basicActive: boolean) {
    this.basicsTabActive = basicActive;
    let path = basicActive ? 'basics' : 'program-builder';
    this.router.navigate([path], {
      queryParamsHandling: 'merge',
      relativeTo: this.route
    });
  }
}
