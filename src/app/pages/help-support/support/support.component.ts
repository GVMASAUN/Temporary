import { Component, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { GarbageCollectorService } from 'src/app/services/garbage-collector.service';
import { SearchTableColumn, SearchTableColumnType } from 'src/app/shared/search-table/search-table.model';

@Component({
  selector: 'app-support',
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.scss']
})
export class SupportComponent implements OnInit, OnDestroy {
  columns: Array<SearchTableColumn> = [
    {
      label: 'Visa Loyalty Suite Support',
      key: 'region',
      sortable: false
    },
    {
      label: 'Email',
      key: 'email',
      type: SearchTableColumnType.EMAIL,
      sortable: false
    }
  ];

  regionData: { region: string, email: string }[] = [
    {
      region: 'ASIA PACIFIC',
      email: 'APLoyaltyTAM@visa.com'
    },
    {
      region: 'CEMEA',
      email: 'Csupport@visa.com'
    },
    {
      region: 'EUROPE',
      email: 'customersupport@visa.com'
    },
    {
      region: 'NORTH AMERICA',
      email: 'VOPService@visa.com'
    },
    {
      region: 'LATIN AMERICA',
      email: 'LACLALoyaltyTAM@visa.com'
    }
  ]

  constructor(
    private viewContainerRef: ViewContainerRef
  ) { }

  ngOnInit(): void { }

  ngOnDestroy(): void {
    GarbageCollectorService.clearDetachedDOMElements
      (
        this,
        this.viewContainerRef
      );
  }


}