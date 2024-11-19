import { AfterViewInit, Component, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { AuthorizationService } from 'src/app/services/authorization.service';
import { GarbageCollectorService } from 'src/app/services/garbage-collector.service';
import { NavStatusService } from 'src/app/services/nav-status/nav-status.service';

@Component({
  selector: 'app-default',
  templateUrl: './default.component.html',
  styleUrls: ['./default.component.scss']
})
export class DefaultComponent implements AfterViewInit, OnInit, OnDestroy {
  constructor(
    private navStatusService: NavStatusService,
    private authService: AuthorizationService,
    private viewContainerRef: ViewContainerRef
  ) { }

  ngAfterViewInit(): void {
  }

  ngOnInit(): void {
    this.authService.state$.subscribe(res => this.navStatusService.setRoute(res.user!))
  }

  ngOnDestroy(): void {
    GarbageCollectorService.clearDetachedDOMElements(
      this,
      this.viewContainerRef
    );
  }
}
