import { Component, HostListener, Inject, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, ValidatorFn, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { ButtonColor, RadioChange } from '@visa/vds-angular';
import { EMPTY, SUCCESS_CODE, VisaIcon } from 'src/app/core/constants';
import { ResponseError } from 'src/app/core/models/pagination-response.model';
import { FormService } from 'src/app/services/form-service/form.service';
import { HttpService } from 'src/app/services/http/http.service';
import { MerchantGroupService } from 'src/app/services/merhant-group/merchant-group.service';
import { CreateDataService } from 'src/app/services/private/create-data.service';
import { TableDataCountService } from 'src/app/services/private/table-data-count.service';
import { ToggleAlertService } from 'src/app/services/toggle-alert/toggle-alert.service';
import { Utils } from 'src/app/services/utils';

@Component({
  selector: 'app-create-dialog',
  templateUrl: './create-dialog.component.html',
  styleUrls: ['./create-dialog.component.scss'],
  providers: [CreateDataService]
})
export class CreateDialogComponent implements OnInit {
  ButtonColor = ButtonColor;
  VisaIcon = VisaIcon;

  addMerchantURL: string = 'api/merchantgroup/createMerchantGroup';

  tabName: string = EMPTY;

  isLoading: boolean = false;

  @HostListener("window:keyup.esc")
  onKeyUp(): void {
    this.dialogRef.close();
  }

  constructor(
    public dialogRef: MatDialogRef<CreateDialogComponent>,
    private fb: UntypedFormBuilder,
    private http: HttpService,
    private merchantGroupService: MerchantGroupService,
    private dataService: CreateDataService,
    private route: ActivatedRoute,
    private formService: FormService,
    private alertService: ToggleAlertService,
    private dataPool: TableDataCountService,
    @Inject(MAT_DIALOG_DATA) private dialogConfig: any
  ) { }

  merchantGroup = this.fb.group({
    merchantGroupName: [EMPTY],
    type: ['MerchantInfo'],
    merchantGroupDescription: [EMPTY]
  });

  private getFormValidationMap(): Map<AbstractControl | null, ValidatorFn | Array<ValidatorFn> | null> {
    const formValidationMap = new Map<AbstractControl | null, ValidatorFn | Array<ValidatorFn> | null>();

    formValidationMap.set(this.merchantGroup.get('merchantGroupName'),
      [Validators.required]
    );

    formValidationMap.set(this.merchantGroup.get('type'),
      [Validators.required]
    );

    return formValidationMap;
  }

  private setErrorMessages(responseErrors: ResponseError[]) {
    this.alertService.showResponseErrors(responseErrors);
    this.merchantGroupService.updateErrorMessages(responseErrors, this.merchantGroup);
  }


  selectType(valueObj: RadioChange) {
    // this.merchantGroup.controls['type'].setValue(valueObj.value);
  }

  ngOnInit(): void {
    this.tabName = this.dialogConfig?.tabName;
  }

  handleSubmit() {
    const valid = this.formService.validate(this.getFormValidationMap())

    if (valid) {
      this.isLoading = true;

      let data = {
        merchantGroups: [
          {
            name: this.merchantGroup.get('merchantGroupName')?.value
          }
        ],
        type: this.merchantGroup.get('type')?.value,
        merchantGroupDescription: this.merchantGroup.get(
          'merchantGroupDescription'
        )?.value,
        optionalComment: this.merchantGroup.get('optionalComment')?.value,
        communityCode: this.route.snapshot.queryParams['client']
      };

      this.dataService.createMerchantData.next(this.merchantGroup.value);

      if (this.merchantGroup.valid)
        this.http.post(this.addMerchantURL, data).subscribe({
          next: (res: any) => {
            this.isLoading = false;

            res = JSON.parse(res.body);

            if ((res.statusCode === SUCCESS_CODE) && Utils.isNull(res?.errors)) {
              this.dataPool.setSelectedMerchant(res.data);
              this.alertService.showSuccessMessage('Merchant Group added successfully.');
              this.dialogRef.close(this.merchantGroup.value);
            } else {
              this.setErrorMessages(res?.errors);

            }
          },
          error: (err: any) => {
            console.log('err', err);
            this.isLoading = false;
          }
        });
    } else {
      this.alertService.showError();
    }
  }

  getErrorMessage(controlName: string): string {
    return this.merchantGroupService.getErrorMessage(this.merchantGroup, controlName);
  }
}
