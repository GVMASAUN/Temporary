import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  ButtonColor,
  ButtonIconType,
  TabsOrientation
} from '@visa/vds-angular';
import { HttpService } from 'src/app/services/http/http.service';


@Component({
  selector: 'app-add-merchant-bin-caid',
  templateUrl: './add-merchant-bin-caid.component.html',
  styleUrls: ['./add-merchant-bin-caid.component.scss']
})
export class AddMerchantBinCaidComponent implements OnInit {
  ButtonIconType = ButtonIconType;
  ButtonColor = ButtonColor;
  TabsOrientation = TabsOrientation;
  loading = false;
  selectedTab = 0;
  // tenant!: Tenant;
  binCaidFlagEnabled: boolean = false;

  constructor(
    private http: HttpService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    if (this.route.snapshot.queryParams['client']) {
      this.checkIsBinCaidEnabled();
    }
  }

  checkIsBinCaidEnabled() {
    this.loading = true;
    let params = { communityCode: this.route.snapshot.queryParams['client'] };
    this.http.get(`api/bincaidstatus`, params).subscribe({
      next: (res: any) => {
        res = JSON.parse(res.body);
        if (res && res.data) {
          this.binCaidFlagEnabled = true;
        }
        this.loading = false;
      },
      error: (err: any) => {
        this.loading = false;
      }
    })
  }
}
