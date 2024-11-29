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
    const baseUrl: string = route?.snapshot?.data?.['baseUrl'];
    const title: string = route?.snapshot?.data?.['title'];

    if(!!baseUrl) {
      this.navStatusService.setModule(baseUrl);
    }

    if(!!title) {
      this.title = title;
    }

    this.titleService.setTitle(this.title);

    if (route.firstChild) {
      this.updatePageConfigs(route.firstChild);
    }
  }

}
