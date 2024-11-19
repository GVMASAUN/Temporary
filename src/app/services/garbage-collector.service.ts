import { ViewContainerRef } from "@angular/core";

export class GarbageCollectorService {
  static clearDetachedDOMElements(
    componentRef: any,
    viewContainerRef: ViewContainerRef,
    deleteComponentElements: boolean = true
  ) {
    viewContainerRef.clear();

    if (deleteComponentElements) {
      Object.keys(componentRef).forEach(key => {
        if (key !== "ngOnDestroy") {
          componentRef[key] = undefined;
          delete componentRef[key];
        }
      });
    }
  }
}
