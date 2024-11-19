import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { ACTIVE_SUB_TAB_STORE_KEY, ACTIVE_TAB_STORE_KEY, ACTIVE_TAB_SUB_MENU_OPENED_KEY, IS_OVERLAY_STORE_KEY, MODULE_KEY, PREVIOUS_NAV_STATUS_KEY } from 'src/app/core/constants';
import { Indicator } from 'src/app/core/models/indicator.model';
import { Module } from 'src/app/core/models/module.model';
import { User } from 'src/app/core/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class NavStatusService {
  private navigationStatus$ = new Subject<boolean>();
  private panelStatus$ = new Subject<boolean>();
  private headerHeight$ = new Subject<string>();
  private isOverlay$ = new Subject<boolean>();
  private hasFooterActions$ = new Subject<boolean>();

  public activeTabIndex$ = new Subject<number>();
  public activeSubTabIndex$ = new Subject<number>();
  public tabSubMenuOpened$ = new Subject<boolean>();


  public isNavigationActive = true;
  public isPanelActive = false;

  get getPanelStatus() {
    return this.panelStatus$.asObservable();
  }

  constructor(
    private readonly _router: Router
  ) {
    this.navigationStatus$.subscribe(isOpen => {
      this.isNavigationActive = isOpen;
    });
    this.panelStatus$.subscribe(isOpen => {
      this.isPanelActive = isOpen;
    });
  }

  toggleNavigation(isOpen: boolean): void {
    this.navigationStatus$.next(isOpen);
    if (isOpen) this.togglePanel(false);
  }

  getNavigationStatus() {
    return this.navigationStatus$.asObservable();
  }

  getPreviousNavigationStatus(): boolean {
    const previousNavStatus = localStorage.getItem(PREVIOUS_NAV_STATUS_KEY) || 'false';
    return JSON.parse(previousNavStatus);
  }

  togglePanel(isOpen: boolean): void {
    localStorage.setItem(PREVIOUS_NAV_STATUS_KEY, JSON.stringify(this.isNavigationActive));
    this.panelStatus$.next(isOpen);
    if (isOpen) this.toggleNavigation(false);
  }

  setTabIndex(index: number) {
    localStorage.setItem(ACTIVE_TAB_STORE_KEY, JSON.stringify(index));
    this.activeTabIndex$.next(index);
  }

  getTabIndex(): number {
    return JSON.parse(localStorage.getItem(ACTIVE_TAB_STORE_KEY) || '0');
  }


  setSubTabIndex(index: number) {
    localStorage.setItem(ACTIVE_SUB_TAB_STORE_KEY, JSON.stringify(index));
    this.activeSubTabIndex$.next(index);
  }

  getSubTabIndex(): number {
    return JSON.parse(localStorage.getItem(ACTIVE_SUB_TAB_STORE_KEY) || '0');
  }


  setTabSubMenuOpened(value: boolean) {
    localStorage.setItem(ACTIVE_TAB_SUB_MENU_OPENED_KEY, JSON.stringify(value));
    this.tabSubMenuOpened$.next(value);
  }

  getTabSubMenuOpened(): boolean {
    return JSON.parse(localStorage.getItem(ACTIVE_TAB_SUB_MENU_OPENED_KEY) || '0');
  }

  setModule(url: string) {
    localStorage.setItem(MODULE_KEY, url);
  }

  getModule(): string {
    return localStorage.getItem(MODULE_KEY) || '';
  }

  setHeaderHeight(height: string) {
    this.headerHeight$.next(height);
  }

  getHeaderHeight() {
    return this.headerHeight$.asObservable();
  }

  setOverlayStatus(value: boolean) {
    localStorage.setItem(IS_OVERLAY_STORE_KEY, value ? Indicator.yes : Indicator.no);
    this.isOverlay$.next(value);
  }

  getOverlayStatus() {
    return this.isOverlay$.asObservable();
  }

  setHasFooterActions(value: boolean) {
    this.hasFooterActions$.next(value);
  }

  getHasFooterActionsObservable() {
    return this.hasFooterActions$.asObservable();
  }

  isOverlayActive(): boolean {
    const overlayIndicator = localStorage.getItem(IS_OVERLAY_STORE_KEY) || Indicator.no;
    return overlayIndicator === Indicator.yes;
  }

  setRoute(user: User): void {
    if (user) {
      if (user.accessToMultipleClients && !user.primaryCommunityLevel) {
        this._router.navigate([Module.CLIENT.baseUrl]).then();
      } else {
        const prams = user.primaryCommunityLevel ? { client: user.primaryCommunityLevel } : {};

        this._router.navigate([Module.PROGRAM.baseUrl], { queryParams: prams, queryParamsHandling: 'merge' }).then();
      }
    }
  }
}
