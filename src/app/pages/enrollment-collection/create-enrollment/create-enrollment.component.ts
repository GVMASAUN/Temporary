import { Component, OnInit } from '@angular/core';
import { ButtonColor, ButtonIconType, ComboboxType } from '@visa/vds-angular';
import { Utils } from 'src/app/services/utils';

@Component({
  selector: 'app-create-enrollment',
  templateUrl: './create-enrollment.component.html',
  styleUrls: ['./create-enrollment.component.scss']
})
export class CreateEnrollmentComponent implements OnInit {
  ComboboxType = ComboboxType;
  ButtonIconType = ButtonIconType;
  ButtonColor = ButtonColor;

  constructor() {}

  timeZone = Utils.getTimeZone();

  ngOnInit(): void {}
}
