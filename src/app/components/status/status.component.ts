import { Component, Input, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { STATUS_BADGE_TYPE, STATUS_DESC } from 'src/app/core/constants';
import { StatusCode } from 'src/app/core/models/status.model';
import { GarbageCollectorService } from 'src/app/services/garbage-collector.service';

@Component({
  selector: 'app-status',
  templateUrl: './status.component.html',
  styles: [
  ]
})
export class StatusComponent implements OnInit, OnDestroy {
  @Input()
  statusCode!: StatusCode;

  STATUS_BADGE_TYPE = STATUS_BADGE_TYPE;
  STATUS_DESC = STATUS_DESC;

  constructor(
    private viewContainerRef: ViewContainerRef
  ) { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    GarbageCollectorService.clearDetachedDOMElements(
      this,
      this.viewContainerRef
    );
  }

}
