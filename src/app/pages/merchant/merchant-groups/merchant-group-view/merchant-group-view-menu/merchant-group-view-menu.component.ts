import { Component, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonColor, DialogService, TabsOrientation } from '@visa/vds-angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EMPTY } from 'src/app/core/constants';
import { GarbageCollectorService } from 'src/app/services/garbage-collector.service';
import { HttpService } from 'src/app/services/http/http.service';
import { NavStatusService } from 'src/app/services/nav-status/nav-status.service';
import { TableDataCountService } from 'src/app/services/private/table-data-count.service';

@Component({
  selector: 'app-merchant-group-view-menu',
  templateUrl: './merchant-group-view-menu.component.html',
  styleUrls: ['./merchant-group-view-menu.component.scss']
})
export class MerchantGroupViewMenuComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  TabsOrientation = TabsOrientation;
  ButtonColor = ButtonColor;

  groupName: string;
  groupType: string;
  groupId: string = EMPTY;

  selectedTab: number;

  initView: boolean = false;

  tabList = [
    { name: 'Basics', value: 'basics', count: 0 },
    { name: 'Merchants', value: 'merchants', count: 0 },
    { name: 'History', value: 'history', count: 0 }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private navStatusService: NavStatusService,
    private dialogService: DialogService,
    private http: HttpService,
    private dataPool: TableDataCountService,
    private viewContainerRef: ViewContainerRef
  ) {
    this.groupName = this.route.snapshot.params['id'];
    this.groupType = this.route.snapshot.queryParams['type'];

    let currentPath = this.router.url
      .split('/')
      .pop()
      ?.split('?')
      .shift();

    this.selectedTab = this.tabList.findIndex(
      data => data.value === currentPath
    );

    // this.dialogService.afterClosed()
    //   .pipe(takeUntil(this.destroy$))
    //     .subscribe(res => {
    //       if (res && !res.isCancel) {
    //         this.getMerchantGroupData(false)
    //       }
    //     })
  }

  ngOnInit(): void {
    this.navStatusService.setOverlayStatus(true);

    this.dataPool.refreshRequest
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: data => {
          switch (data) {
            case 'merchant':
              this.groupName = this.route.snapshot.params['id'];
              this.groupType = this.route.snapshot.queryParams['type'];

              this.getMerchantGroupData();
              break;
          }
        }
      });

    this.dataPool.getMerchantData()
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: res => {
          if (res && res.data) {
            this.dataPool.setSelectedMerchant(res.data);

            this.groupName = res.data.name;
            this.dataPool.setMerchantCount(res.data.merchantGroupCount);
          }
        }
      });

    this.dataPool.getMerchantCount().pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        this.tabList[1].count = count;
      });

    this.dataPool.getSelectedMerchant()
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (res: any) => {
          this.groupName = res.name;
          this.groupType = res.merchantGroupType;
          this.groupId = res.id;
        }
      });

    this.getAllData();
  }

  getAllData() {
    this.getMerchantGroupData();
  }

  getMerchantGroupData(updateMerchantData: boolean = true) {
    let param = {
      merchantGroupName: this.groupName,
      communityCode: this.route.snapshot.queryParams['client'],
      merchantGroupId: this.groupId
    };

    this.http.get('api/merchantgroup/viewMerchantGroup', param).subscribe({
      next: (res: any) => {
        res = JSON.parse(res.body);

        this.tabList[1].count = res.data.merchantGroupCount;

        if (updateMerchantData) {
          this.dataPool.setMerchantData(res);
          this.dataPool.refreshRequest.next('');
        }

        this.initView = true;
      },
      error: err => {
        console.log(err);
      }
    });
  }

  ngOnDestroy(): void {
    this.dataPool.setMerchantData([]);
    this.navStatusService.setOverlayStatus(false);

    this.destroy$.next();
    this.destroy$.complete();

    GarbageCollectorService.clearDetachedDOMElements(
      this,
      this.viewContainerRef
    )
  }
}
