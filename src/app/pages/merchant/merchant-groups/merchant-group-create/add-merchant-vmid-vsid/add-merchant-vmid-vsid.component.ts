import { Component, OnInit } from '@angular/core';
import {
  ButtonColor,
  ButtonIconType,
  TabsOrientation
} from '@visa/vds-angular';

@Component({
  selector: 'app-add-merchant-vmid-vsid',
  templateUrl: './add-merchant-vmid-vsid.component.html',
  styleUrls: ['./add-merchant-vmid-vsid.component.scss']
})
export class AddMerchantVmidVsidComponent implements OnInit {
  ButtonIconType = ButtonIconType;
  ButtonColor = ButtonColor;
  TabsOrientation = TabsOrientation;

  loading: boolean = false;
  selectedTab: number = 0;

  constructor() {}

  ngOnInit(): void {}
}
