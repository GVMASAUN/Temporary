import { AfterViewInit, Directive, ElementRef, Input } from "@angular/core";

@Directive({
    selector: '[sticky]',
})
export class StickyDirective implements AfterViewInit {
    @Input()
    disableSticky: boolean = false;

    constructor(
        private elementRef: ElementRef,
    ) { }

    ngAfterViewInit() {

        setTimeout(() => {
            if (!this.disableSticky) {
                const el = this.elementRef.nativeElement as HTMLElement;
                const rowDistance = el.parentElement?.getBoundingClientRect().left!;
                const { x } = el.getBoundingClientRect();

                el.style.position = 'sticky';
                el.style.left = `${x - rowDistance}px`;
                el.style.zIndex = '1';
            }
          }, 500);
    }
}