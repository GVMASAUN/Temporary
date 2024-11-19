import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { ButtonColor, ButtonIconType, TabsOrientation } from '@visa/vds-angular';
import { UserStep } from '../user.model';
import { Router } from '@angular/router';
import { NavStatusService } from 'src/app/services/nav-status/nav-status.service';
import { GarbageCollectorService } from 'src/app/services/garbage-collector.service';
import { FunctionsService } from 'src/app/services/util/functions.service';

@Component({
  selector: 'app-manage-user',
  templateUrl: './manage-user.component.html',
  styleUrls: ['./manage-user.component.scss']
})
export class ManageUserComponent implements OnInit {
  ButtonColor = ButtonColor;
  ButtonIconType = ButtonIconType;
  UserStep = UserStep;
  TabsOrientation = TabsOrientation;

  selectedTabIndex: number = 0;

  tabs: string[] = [
    UserStep.DETAILS,
    UserStep.HISTORY
  ]
  readonly viewName = "manage-user";

  getTabId: Function = this.functionService.getTabId;
  getTabLabelledById: Function = this.functionService.getTabLabelledById;

  constructor(
    private router: Router,
    private navStatusService: NavStatusService,
    private viewContainerRef: ViewContainerRef,
    private functionService: FunctionsService
  ) { }

  private navigateToUserList() {
    this.router.navigate(['users'], {
      queryParamsHandling: 'merge'
    });
  }

  ngOnInit(): void {
    this.navStatusService.setOverlayStatus(true);
  }

  close() {
    this.navigateToUserList();
  }

  save() {
    this.navigateToUserList();
  }

  ngOnDestroy(): void {
    this.navStatusService.setOverlayStatus(false);

    GarbageCollectorService.clearDetachedDOMElements(
      this,
      this.viewContainerRef
    );

  }

}
