import { Component, Input, OnInit } from '@angular/core';
import { ButtonIconType, TooltipPosition } from '@visa/vds-angular';
import { EMPTY } from 'src/app/core/constants';

@Component({
  selector: 'app-overlay',
  templateUrl: './overlay.component.html',
  styleUrls: ['./overlay.component.scss']
})
export class OverlayComponent implements OnInit {
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

  constructor() {}

  ngOnInit(): void {}

}
