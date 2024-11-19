import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Module } from './core/models/module.model';
import { NavStatusService } from './services/nav-status/nav-status.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title: string = 'Visa'

  constructor(
    private titleService: Title,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private navStatusService: NavStatusService
  ) { }

  ngOnInit() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.updatePageConfigs(this.activatedRoute);
      }
    });
  }

  private updatePageConfigs(route: ActivatedRoute) {
    const module: Module = route?.snapshot?.data?.['module'];

    if (module) {
      if (!!module?.uiName) {
        this.title = module.uiName;
      }

      this.navStatusService.setModule(module.baseUrl);
    }

    this.titleService.setTitle(this.title);

    if (route.firstChild) {
      this.updatePageConfigs(route.firstChild);
    }
  }

}
