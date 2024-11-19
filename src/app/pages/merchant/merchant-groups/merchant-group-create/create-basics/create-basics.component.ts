import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BadgeType, ButtonColor, RadioChange } from '@visa/vds-angular';
import { EMPTY, SUCCESS_CODE } from 'src/app/core/constants';
import { HttpService } from 'src/app/services/http/http.service';
import { NavStatusService } from 'src/app/services/nav-status/nav-status.service';
import { CreateDataService } from 'src/app/services/private/create-data.service';
import { ToggleAlertService } from 'src/app/services/toggle-alert/toggle-alert.service';
import { Utils } from 'src/app/services/utils';

@Component({
  selector: 'app-create-basics',
  templateUrl: './create-basics.component.html',
  styleUrls: ['./create-basics.component.scss']
})
export class CreateBasicsComponent implements OnInit, OnDestroy {
  BadgeType = BadgeType;
  ButtonColor = ButtonColor;

  data: any = null;

  merchantGroup = this.fb.group({
    name: [EMPTY, Validators.required],
    type: ['MerchantInfo', Validators.required],
    description: [EMPTY, Validators.required],
    optionalComment: [EMPTY],
    communityCode: this.route.snapshot.queryParams['client']
  });

  constructor(
    private fb: UntypedFormBuilder,
    private dataService: CreateDataService,
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpService,
    private status: NavStatusService,
    private alertService: ToggleAlertService
  ) {
    this.data = this.dataService.createMerchantData.getValue();

    if (this.data) {
      this.merchantGroup.controls['name'].setValue(this.data.name || '');
      this.merchantGroup.controls['type'].setValue(
        this.data.type || 'MerchantInfo'
      );
      this.merchantGroup.controls['description'].setValue(
        this.data.description || ''
      );
      this.merchantGroup.controls['optionalComment'].setValue(
        this.data.optionalComment || ''
      );
    }
  }

  updateState() {
    if (this.merchantGroup.valid)
      this.dataService.createMerchantData.next(this.merchantGroup.value);
  }

  ngOnInit(): void {
    this.status.setOverlayStatus(true);
  }

  ngOnDestroy(): void {
    this.status.setOverlayStatus(false);
  }

  selectMerchantGroupType(valueObj: RadioChange) {
    this.merchantGroup.controls['type'].setValue(valueObj.value);
  }

  nextPage() {
    this.updateState();
    console.log(this.dataService.createMerchantData.getValue());

    this.router.navigate(['/merchant/create/merchants'], {
      queryParams: { type: this.merchantGroup.value.type },
      queryParamsHandling: 'merge'
    });
  }

  saveAndExit() {
    this.http
      .post(`api/merchantgroup/createMerchantGroup`, this.merchantGroup.value)
      .subscribe({
        next: (res: any) => {
          res = JSON.parse(res.body);

          if ((res?.statusCode === SUCCESS_CODE) && Utils.isNull(res?.errors)) {
            this.router.navigate(['/merchant'], {
              queryParamsHandling: 'merge'
            });
          } else {
            this.alertService.showResponseErrors(res?.errors);
          }

        },
        error: err => {
          console.log(err);
        }
      });
  }
}
