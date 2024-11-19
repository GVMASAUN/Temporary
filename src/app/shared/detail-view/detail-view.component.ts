import { Component, Input, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { Field } from './detail-view.model';
import { GarbageCollectorService } from 'src/app/services/garbage-collector.service';

@Component({
  selector: 'app-detail-view',
  templateUrl: './detail-view.component.html',
  styleUrls: ['./detail-view.component.scss']
})
export class DetailViewComponent implements OnInit, OnDestroy {
  @Input()
  fields!:Field[];

  @Input()
  data?:any;

  constructor(private viewContainerRef: ViewContainerRef) { }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    GarbageCollectorService.clearDetachedDOMElements(
      this,
      this.viewContainerRef
    );
  }

}
