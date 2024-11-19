import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EMPTY } from 'src/app/core/constants';

@Component({
  selector: 'app-history-details',
  templateUrl: './history-details.component.html',
  styleUrls: ['./history-details.component.scss']
})
export class HistoryDetailsComponent implements OnInit {
  constructor(private route: ActivatedRoute) { }

  title: string = EMPTY;
  showHeader: boolean = false;

  merchantType = this.route.snapshot.queryParams['type'];

  column = [
    this.merchantType == 'AcquirerInfo'
      ? [
        { label: 'BIN', key: 'bin' },
        { label: 'CAID', key: 'caid' }
      ]
      : [
        { label: 'VMID', key: 'vmid' },
        { label: 'VSID', key: 'vsid' }
      ],

    { label: 'ExternalID', key: 'externalId' },
    { label: 'Start Date', key: 'sDate' },
    { label: 'End Date', key: 'eDate' }
  ].flat();

  ngOnInit(): void {
    const type = this.route.snapshot.params['type'];

    switch (type) {
      case 'group':
        this.title = 'Merchant Group';
        this.showHeader = false;
        break;
      case 'added':
        this.title = 'Added Merchants';
        this.showHeader = true;
        break;
      case 'removed':
        this.title = 'Removed Merchants';
        this.showHeader = true;
        break;
      case 'modified':
        this.title = 'Modified Merchants';
        this.showHeader = false;
        break;
    }
  }
}
