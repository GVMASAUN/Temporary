import { Component, EventEmitter, KeyValueDiffer, KeyValueDiffers, OnDestroy, OnInit, Output, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { ButtonColor, ButtonIconType, NavColorScheme, NavLogoVisaType, NavPosition, TabsOrientation, TextShade, TooltipPosition } from '@visa/vds-angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EMPTY, VisaIcon } from 'src/app/core/constants';
import { Module } from 'src/app/core/models/module.model';
import { User } from 'src/app/core/models/user.model';
import { ClientSelectDialogComponent } from 'src/app/pages/clients/dialog/client-select-dialog.component';
import { AuthorizationService } from 'src/app/services/authorization.service';
import { ClientService } from 'src/app/services/client/client.service';
import { GarbageCollectorService } from 'src/app/services/garbage-collector.service';
import { IMenuItem } from 'src/app/services/interfaces/menu.model';
import { LoginService } from 'src/app/services/login/login.service';
import { LogoutService } from 'src/app/services/logout/logout.service';
import { MenuService } from 'src/app/services/menu.service';
import { NavStatusService } from 'src/app/services/nav-status/nav-status.service';
import { AppStoreService } from 'src/app/services/stores/app-store.service';
import { ToggleAlertService } from 'src/app/services/toggle-alert/toggle-alert.service';
import { FunctionsService } from 'src/app/services/util/functions.service';
import { Utils } from 'src/app/services/utils';
import { SiteMapComponent } from '../site-map/site-map.component';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
})
export class NavigationComponent implements OnInit, OnDestroy {
  @Output()
  skip = new EventEmitter<void>();

  private destroy$ = new Subject<void>();

  readonly viewName: string = 'navigation';

  navColorSchemeV = NavColorScheme.VAULT;
  visaLogoColorV = NavLogoVisaType.BLUE;
  TextShade = TextShade;
  ButtonColor = ButtonColor;
  ButtonIconType = ButtonIconType;
  NavPosition = NavPosition;
  TooltipPosition = TooltipPosition;
  TabsOrientation = TabsOrientation;
  VisaIcon = VisaIcon;

  selectedIndex: number = 0;
  selectedSubMenuIndex: number = 0;

  isExpanded: boolean = false;
  isOverlay: boolean = false;
  isClientActive: boolean = false;
  initTab: boolean = true;
  navOpen: boolean = this.navStatusService.isNavigationActive;
  openSubNav: boolean = false;

  clientName: string = EMPTY;
  userName: string = EMPTY;
  backRoute: string = EMPTY;

  menus: IMenuItem[] = [];

  user: User = {};
  originalMenu: IMenuItem[] = this.menus;

  differ: KeyValueDiffer<string, any>;

  getTabId: Function = this.functionService.getTabId;
  getTabLabelledById: Function = this.functionService.getTabLabelledById;

  constructor(
    private menuService: MenuService,
    private authorizationService: AuthorizationService,
    private differs: KeyValueDiffers,
    private navStatusService: NavStatusService,
    private logoutService: LogoutService,
    private loginService: LoginService,
    private alertService: ToggleAlertService,
    private viewContainerRef: ViewContainerRef,
    private functionService: FunctionsService,
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog,
    private clientService: ClientService,
    private appStoreService: AppStoreService,
    protected router: Router
  ) {
    this.differ = this.differs.find({}).create();
  }

  private getUserDetailFromSession(): void {
    this.user = this.authorizationService.readUserSession();

    this.userName = this.user.userDisplayName!;

    if (this.user.primaryCommunityLevel && !this.user.accessToMultipleClients) {
      // this.setCommunityLevel();
    } else if (this.user.warningMsg) {
      this.alertService.showError(this.user.warningMsg);
    }
  }

  private evaluateMenu(): void {
    this.menus = this.menuService.getRoleWiseMenu(this.user.userRole!);
    this.originalMenu = [...this.menus];

    this.navStatusService.getOverlayStatus().pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: boolean) => {
        this.isOverlay = data;

        if (this.isOverlay) {
          this.navOpen = false;
        } else {
          this.navOpen = true;
        }
      },
    });
  }

  private validateAndUpdatePageConfig(): void {
    if (this.menus) {
      const prvModule: string = this.navStatusService.getModule();
      const prvActiveTabIndex: number = this.navStatusService.getTabIndex();

      if (prvModule) {
        const requiredTabIndex: number = this.menus.findIndex(mn => mn.module.baseUrl === prvModule);

        if ((prvActiveTabIndex !== requiredTabIndex)) {
          this.selectedIndex = requiredTabIndex;
          this.navStatusService.setTabIndex(requiredTabIndex);

          const menu = this.menus[requiredTabIndex];
          const prvSUbMenuIndex = this.navStatusService.getSubTabIndex();

          if (menu?.subMenus) {
            this.selectedSubMenuIndex = prvSUbMenuIndex;
          }

          this.navStatusService.setOverlayStatus(false);

          return;
        }
      }

      this.selectedIndex = this.navStatusService.getTabIndex();
      this.selectedSubMenuIndex = this.navStatusService.getSubTabIndex();
    }
  }

  private menuManipulator(): void {
    this.initTab = false;

    this.menus = this.originalMenu.filter((menuItem: IMenuItem) => {
      if (this.isClientActive) {
        return menuItem.module.uiName != Module.CLIENT.uiName;
      } else {
        return ![
          Module.PROGRAM.uiName,
          Module.MERCHANT.uiName,
          Module.EPM_TEMPLATE.uiName,
          Module.UNCATEGORIZED_OFFER.uiName,
          Module.EVENT_GROUP_TEMPLATE.uiName
        ].includes(menuItem.module.uiName
        );
      }
    });

    this.validateAndUpdatePageConfig();


    setTimeout(() => {
      this.initTab = true;
    }, 0);
  }

  private init(): void {
    this.getUserDetailFromSession();
    this.evaluateMenu();

    this.navStatusService.getNavigationStatus().pipe(takeUntil(this.destroy$)).subscribe({
      next: (navStatus) => {
        this.navOpen = navStatus;
      },
    });

    this.activatedRoute.queryParamMap.pipe(takeUntil(this.destroy$)).subscribe({
      next: (queryParam) => {
        this.isClientActive = !!queryParam.get('client');

        if (this.isClientActive) {
          this.clientName = queryParam.get('client') || EMPTY;

          this.clientService.setCommunityCode(this.clientName);
        }

        this.menuManipulator();
      },
    });

    this.isOverlay = this.navStatusService.isOverlayActive();

    if (this.isOverlay) {
      this.navOpen = false;
    } else {
      this.navOpen = true;
    }
  }

  protected toggleSubMenu(index: number) {
    if (index > -1) {
      // this.selectedSubMenuIndex = -1;
      const menuItem = this.menus[index];
      menuItem.isSubMenuOpened = !menuItem.isSubMenuOpened;
    }
  }

  protected hasSubMenu(menu: IMenuItem) {
    return menu.subMenus && (menu.subMenus.length > 0);
  }

  ngOnInit(): void {
    this.router.events.pipe(takeUntil(this.destroy$)).subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.validateAndUpdatePageConfig();
      }
    });

    if (Utils.isNull(this.authorizationService.readUserSession())) {
      this.loginService.getUserDetails(() => {
        this.init();
        this.menuManipulator();
      });
    } else {
      this.init();
    }

    this.navStatusService.activeTabIndex$.pipe(takeUntil(this.destroy$)).subscribe((index) => {
      this.selectedIndex = index;
    });

    this.navStatusService.activeSubTabIndex$.pipe(takeUntil(this.destroy$)).subscribe((index) => {
      this.selectedSubMenuIndex = index;
    });
  }

  ngDoCheck(): void {
    const change = this.differ.diff(this);
    if (change) {
      change.forEachChangedItem((item) => {
        if (item.key == 'navOpen') {
          this.navStatusService.toggleNavigation(item.currentValue);
        }
      });
    }
  }

  skipToMainContent(): void {
    this.navOpen = false;
    this.skip.next();
  }

  selectedState(index: number): void {
    this.toggleSubMenu(index);
    this.dialog.closeAll();

    this.selectedIndex = index;
    this.navStatusService.setTabIndex(index);
    this.navStatusService.setSubTabIndex(-1);

    this.appStoreService.clearSearchTableState();
  }

  setSubMenuState(index: number) {
    this.selectedSubMenuIndex = index;
    this.navStatusService.setSubTabIndex(index);
  }

  logout(): void {
    this.logoutService.logout();
  }

  openClientSelectionDialog(): void {
    this.dialog.open(
      ClientSelectDialogComponent,
      {
        hasBackdrop: true,
        disableClose: true,
        width: '1250px',
        ariaLabel: 'client-select-dialog',
      }
    );
  }

  openSiteMapDialog(): void {
    this.dialog.open(
      SiteMapComponent,
      {
        hasBackdrop: true,
        disableClose: true,
        width: '1250px',
        ariaLabel: 'site-map-dialog',
        data: {
          menuData: this.menus,
        },
      });
  }

  back(): void {
    this.dialog.closeAll();

    this.activatedRoute.children[0].url.pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        if (res) {
          this.backRoute = res[0].path;
        }
      },
    });

    this.router.navigate([this.backRoute], {
      relativeTo: this.activatedRoute,
      queryParams: { type: null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    GarbageCollectorService.clearDetachedDOMElements(
      this,
      this.viewContainerRef
    );
  }
}
