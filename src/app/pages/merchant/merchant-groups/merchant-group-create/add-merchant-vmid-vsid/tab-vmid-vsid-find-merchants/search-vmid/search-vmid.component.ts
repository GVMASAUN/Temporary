import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonColor, ButtonType } from '@visa/vds-angular';
import { SUCCESS_CODE } from 'src/app/core/constants';
import { HttpService } from 'src/app/services/http/http.service';
import { Utils } from 'src/app/services/utils';
import { countryCodes } from 'src/assets/constants/country-codes';

@Component({
  selector: 'app-search-vmid',
  templateUrl: './search-vmid.component.html',
  styleUrls: ['./search-vmid.component.scss']
})
export class SearchVmidComponent implements OnInit {
  @Output() data = new EventEmitter<any>();

  ButtonColor = ButtonColor;
  ButtonType = ButtonType;

  vmidMerchantData = this.fb.group({
    communityCode: this.route.snapshot.queryParams['client'],
    merchantName: ['', Validators.required],
    countryCode: ['', Validators.required]
  });
  tableData = [];
  loading = false;
  countries = countryCodes;
  errMsg = '';

  constructor(
    private http: HttpService,
    private router: Router,
    private fb: UntypedFormBuilder,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {}

  findMerchant() {
    this.loading = true;
    this.http
      .get('api/merchantsearch/vmid', this.vmidMerchantData.value)
      .subscribe({
        next: (res: any) => {
          this.loading = false;
          res = JSON.parse(res.body);

          if ((res.statusCode === SUCCESS_CODE) && Utils.isNull(res.errors)) {
            // res = res.result.merchantDetails;
            // this.tableData = res;
            this.data.emit({
              tableNo: 2,
              tableData: res.data
            });
          } else {
            this.errMsg = res.errors
              .map((err: any) => err.errorMessage)
              .join(', ');
          }
        },
        error: err => {
          this.loading = false;
          console.log(err);
        }
      });
  }
}
