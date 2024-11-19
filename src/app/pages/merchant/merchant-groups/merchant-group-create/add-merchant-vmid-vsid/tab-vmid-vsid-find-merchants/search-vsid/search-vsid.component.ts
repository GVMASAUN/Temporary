import { HttpStatusCode } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ButtonColor, ButtonType } from '@visa/vds-angular';
import { ClientService } from 'src/app/services/client/client.service';
import { HttpService } from 'src/app/services/http/http.service';
import { ToggleAlertService } from 'src/app/services/toggle-alert/toggle-alert.service';
import { Utils } from 'src/app/services/utils';
import { countryCodes } from 'src/assets/constants/country-codes';
import { SearchTypeEnum, VSIDMerchant } from './search-vsid.model';

@Component({
  selector: 'app-search-vsid',
  templateUrl: './search-vsid.component.html',
  styleUrls: ['./search-vsid.component.scss']
})
export class SearchVsidComponent implements OnInit {
  @Output() data = new EventEmitter<any>();
  readonly defaultSearchType = SearchTypeEnum.VISA_MERCHANT_NAME;

  ButtonColor = ButtonColor;
  ButtonType = ButtonType;
  SearchTypeEnum = SearchTypeEnum;

  searchTypeId: number = this.defaultSearchType;
  countries = countryCodes;

  vsidMerchantForm = this.formBuilder.group(new VSIDMerchant());

  searchTypes = [
    {
      id: SearchTypeEnum.VISA_MERCHANT_NAME,
      typeName: 'Visa Merchant by Name'
    },
    {
      id: SearchTypeEnum.MERCHANT_ADDRESS,
      typeName: 'Merchant Address'
    },
    {
      id: SearchTypeEnum.ACQ_BIN_AND_CARD_ACCEPTOR_ID,
      typeName: 'Acquiring BIN & Card Acceptor ID (CAID)'
    },
    {
      id: SearchTypeEnum.ACQ_BID_AND_ACQ_MID_ID,
      typeName: 'Acquirer BID & Acquirer Merchant ID (MID)'
    },
    {
      id: SearchTypeEnum.CARD_ACCEPTOR_ID_OR_ACQ_MERCHANT_ID,
      typeName: 'Card Acceptor ID (CAID) or Acquirer Merchant ID (MID)'
    }
  ];

  loading: boolean = false;

  get vsidMerchant(): VSIDMerchant {
    return this.vsidMerchantForm.getRawValue() as VSIDMerchant;
  }

  constructor(
    private httpService: HttpService,
    private formBuilder: UntypedFormBuilder,
    private clientService: ClientService,
    private alertService: ToggleAlertService
  ) { }

  ngOnInit(): void { }

  getUrl(): string {
    if ((this.searchTypeId === SearchTypeEnum.VISA_MERCHANT_NAME)) {
      return 'api/merchantsearch/vmid'
    } else {
      return 'api/merchantsearch/vsid'
    }
  }

  getParams() {
    const obj = Object.entries(this.vsidMerchantForm.value).filter(([key, val]) => val !== null)

    return Object.fromEntries(obj);
  }

  findMerchant() {
    this.loading = true;

    this.vsidMerchantForm.get('communityCode')?.patchValue(this.clientService.communityCode);

    this.httpService
      .get(this.getUrl(), this.getParams())
      .subscribe({
        next: (res: any) => {
          this.loading = false;
          const response = JSON.parse(res.body);

          if ((response?.statusCode === HttpStatusCode.Ok) && Utils.isNull(response?.errors)) {
            if (JSON.stringify(response) != '{}') {
              this.data.emit({
                tableNo: 3,
                tableData: response.data
              });
            }
          } else {
            this.alertService.showResponseErrors(response.errors);
          }
        },
        error: err => {
          this.loading = false;
          console.log(err);
        }
      });
  }

  reset() {
    // setTimeout(() => {
    //   this.vsidMerchantForm.get('merchantSearchType')?.setValue('Exact');
    // }, 1);
    this.vsidMerchantForm = this.formBuilder.group(new VSIDMerchant());
  }

  searchTypeChange(type: number) {
    this.vsidMerchantForm = this.formBuilder.group(new VSIDMerchant());

    this.searchTypeId = Number(type);
  }

  disableFindMerchant(): boolean {
    if (this.searchTypeId === SearchTypeEnum.VISA_MERCHANT_NAME) {
      return !(
        this.vsidMerchantForm.get('merchantName')?.value &&
        this.vsidMerchantForm.get('countryCode')?.value
      );
    } else if (this.searchTypeId === SearchTypeEnum.MERCHANT_ADDRESS) {
      return !(
        this.vsidMerchantForm.get('merchantName')?.value &&
        this.vsidMerchantForm.get('countryCode')?.value &&
        this.vsidMerchantForm.get('city')?.value
      );
    }
    else if (this.searchTypeId === SearchTypeEnum.ACQ_BIN_AND_CARD_ACCEPTOR_ID) {
      return !(
        this.vsidMerchantForm.get('acquirerBin')?.value &&
        this.vsidMerchantForm.get('cardAcceptorId')?.value
      );
    } else if (this.searchTypeId === SearchTypeEnum.ACQ_BID_AND_ACQ_MID_ID) {
      return !(
        this.vsidMerchantForm.get('acquirerMid')?.value &&
        this.vsidMerchantForm.get('acquirerBid')?.value
      );
    } else if (this.searchTypeId === SearchTypeEnum.CARD_ACCEPTOR_ID_OR_ACQ_MERCHANT_ID) {
      return !this.vsidMerchantForm.get('cardAcceptorId')?.value && !this.vsidMerchantForm.get('acquirerMid')?.value;
    }

    return true;
  }
}
