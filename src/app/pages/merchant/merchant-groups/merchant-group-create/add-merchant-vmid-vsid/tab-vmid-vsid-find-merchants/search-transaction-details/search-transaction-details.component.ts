import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ButtonColor, ButtonType, RadioChange } from '@visa/vds-angular';
import { EMPTY, SUCCESS_CODE } from 'src/app/core/constants';
import { HttpService } from 'src/app/services/http/http.service';
import { ToggleAlertService } from 'src/app/services/toggle-alert/toggle-alert.service';
import { Utils } from 'src/app/services/utils';
import { countryCodes } from 'src/assets/constants/country-codes';

@Component({
  selector: 'app-search-transaction-details',
  templateUrl: './search-transaction-details.component.html',
  styleUrls: ['./search-transaction-details.component.scss']
})
export class SearchTransactionDetailsComponent implements OnInit {
  @Output() data = new EventEmitter<any>();

  ButtonColor = ButtonColor;
  ButtonType = ButtonType;

  errMsg: string = EMPTY;
  loading: boolean = false;
  countries = countryCodes;

  tableData: any[] = [];

  MerchantData = this.fb.group({
    type: ['visaMerchantId', Validators.required],
    num: [EMPTY, Validators.required],
    countryCode: [EMPTY, Validators.required]
  });

  constructor(
    private http: HttpService,
    private fb: UntypedFormBuilder,
    private route: ActivatedRoute,
    private readonly alertService: ToggleAlertService
  ) { }

  ngOnInit(): void { }

  valueChanged(e: RadioChange) {
    this.MerchantData.get('num')?.setValue('');
  }

  reset() {
    setTimeout(() => {
      this.MerchantData.get('type')?.setValue('visaMerchantId');
    }, 1);
  }

  findMerchant() {
    this.loading = true;

    let sendingParams: any = {
      communityCode: this.route.snapshot.queryParams['client'],
      countryCode: this.MerchantData.get('countryCode')?.value,
      type: this.MerchantData.get('type')?.value
    };
    sendingParams[
      sendingParams.type == 'visaMerchantId' ? 'vmid' : 'vsid'
    ] = this.MerchantData.get('num')?.value;

    this.http.get('api/merchantsearch/id', sendingParams).subscribe({
      next: (res: any) => {
        this.loading = false;
        res = JSON.parse(res.body);

        if ((res.statusCode === SUCCESS_CODE) && Utils.isNull(res.errors)) {
          this.data.emit({
            tableNo: 1,
            tableData: res.data
          });
        } else {
            this.alertService.showResponseErrors(res.errors);

        }
      },
      error: err => {
        this.loading = false;
        this.errMsg = err.error.message;
      }
    });
  }
}
