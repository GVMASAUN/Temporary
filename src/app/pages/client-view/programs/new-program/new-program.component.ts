import { Component, OnDestroy, OnInit } from '@angular/core';
import { BadgeType } from '@visa/vds-angular';
import { NavStatusService } from 'src/app/services/nav-status/nav-status.service';

@Component({
  selector: 'app-new-program',
  templateUrl: './new-program.component.html',
  styleUrls: ['./new-program.component.scss']
})
export class NewProgramComponent implements OnInit, OnDestroy {
  badgeType = BadgeType;

  constructor(private status: NavStatusService) {}

  ngOnInit(): void {
    this.status.setOverlayStatus(true);
  }
  ngOnDestroy(): void {
    this.status.setOverlayStatus(false);
  }
}
