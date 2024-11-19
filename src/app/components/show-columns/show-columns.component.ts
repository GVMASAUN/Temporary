import {
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { ButtonIconType } from '@visa/vds-angular';
import { GarbageCollectorService } from 'src/app/services/garbage-collector.service';

@Component({
  selector: 'app-show-columns',
  templateUrl: './show-columns.component.html',
  styleUrls: ['./show-columns.component.scss']
})
export class ShowColumnsComponent implements OnInit {
  @ViewChild('toggle')
  toggle!: ElementRef;

  @ViewChild('menu')
  menu!: ElementRef;

  @Input()
  columns: any;

  @Input()
  isDisabled: boolean = false;

  ButtonIconType = ButtonIconType;

  menuOpen: boolean = false;
  selectedItems: Array<any> = [];

  constructor(
    private viewContainerRef: ViewContainerRef
  ) { }

  ngOnInit(): void {
    this.selectedItems = this.columns
      .filter((item: any) => item.checked)
      .map((item: any) => item.label);
  }

  changeMultiSelectPreSelected(selectedValues: any) {
    this.columns.forEach((item: any) => {
      if (selectedValues.find((value: any) => value === item.value)) {
        item.checked = true;
      } else {
        item.checked = false;
      }
    });

    this.selectedItems = this.columns
      .filter((item: any) => item.checked)
      .map((item: any) => item.label);
  }

  ngOnDestroy(): void {
    GarbageCollectorService.clearDetachedDOMElements(
      this,
      this.viewContainerRef
    );
  }
}
