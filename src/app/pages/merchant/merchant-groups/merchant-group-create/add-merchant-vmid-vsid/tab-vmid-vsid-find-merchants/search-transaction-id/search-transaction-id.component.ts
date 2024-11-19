import { DatePipe } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ButtonColor, ButtonType } from '@visa/vds-angular';
import { SUCCESS_CODE } from 'src/app/core/constants';
import { HttpService } from 'src/app/services/http/http.service';
import { ToggleAlertService } from 'src/app/services/toggle-alert/toggle-alert.service';
import { Utils } from 'src/app/services/utils';

@Component({
  selector: 'app-search-transaction-id',
  templateUrl: './search-transaction-id.component.html',
  styleUrls: ['./search-transaction-id.component.scss'],
  providers: [DatePipe]
})
export class SearchTransactionIdComponent implements OnInit {
  @Output() data = new EventEmitter<any>();

  ButtonColor = ButtonColor;
  ButtonType = ButtonType;
  tableData: any[] = [];

  transIDMerchantData = this.fb.group({
    communityCode: this.route.snapshot.queryParams['client'],
    transactionId: ['', Validators.required],
    transactionDate: ['', Validators.required],
    userCommunityCode: ['', Validators.required]
  });
  loading = false;
  errMsg = '';

  constructor(
    private http: HttpService,
    private fb: UntypedFormBuilder,
    private datepipe: DatePipe,
    private route: ActivatedRoute,
    private readonly alertService: ToggleAlertService
  ) { }

  private mapData(data: any[]): any[] {
    return data.map((item) => {
      const address = item?.visaStoreEnrichedAddress;
      return ({
        ...item,
        merchantStreetAddress: address?.address || '-',
        merchantCity: address?.city || '-',
        merchantState: address?.state || '-',
        merchantCountryCode: address?.countryCode || '-',
        merchantPostalCode: address?.postalCode || '-'
      });
    });
  }


  ngOnInit(): void { }

  dateChange(e: any): void {
    let formatedDate = this.datepipe.transform(e, 'yyyy-MM-dd');
    this.transIDMerchantData.get('transactionDate')?.setValue(formatedDate);
  }

  findMerchant(): void {
    this.loading = true;
    this.http
      .post('api/merchantsearch/txId', this.transIDMerchantData.value)
      .subscribe({
        next: (res: any) => {
          this.loading = false;
          res = JSON.parse(res.body);

          if ((res.statusCode === SUCCESS_CODE) && Utils.isNull(res.errors)) {
            // this.tableData = res.result.merchantDetails;
            this.data.emit({
              tableNo: 3, //VLS-378 comment
              tableData: this.mapData(res?.data)
            });
          } else {
            this.alertService.showResponseErrors(res.errors);
          }
        },
        error: err => {
          this.loading = false;
          console.log(err);
        }
      });
  }
}
