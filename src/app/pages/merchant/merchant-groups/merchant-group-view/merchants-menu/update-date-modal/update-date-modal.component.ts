import { AfterViewInit, Component, HostListener, Inject, OnInit } from '@angular/core';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  ButtonColor,
  CALENDAR_PLACEMENT
} from '@visa/vds-angular';
import * as moment from 'moment';
import { DateTimeFormat, EMPTY, SUCCESS_CODE } from 'src/app/core/constants';
import { FormService } from 'src/app/services/form-service/form.service';
import { HttpService } from 'src/app/services/http/http.service';
import { MerchantGroupService } from 'src/app/services/merhant-group/merchant-group.service';
import { ToggleAlertService } from 'src/app/services/toggle-alert/toggle-alert.service';
import { DateUtils } from 'src/app/services/util/dateUtils';
import { Utils } from 'src/app/services/utils';

@Component({
  selector: 'app-update-date-modal',
  templateUrl: './update-date-modal.component.html',
  styleUrls: ['./update-date-modal.component.scss']
})
export class UpdateDateModalComponent implements OnInit, AfterViewInit {
  @HostListener("window:keyup.esc")
  onKeyUp(): void {
    this.close();
  }

  buttonColor = ButtonColor;
  DateFormat = DateTimeFormat;
  CALENDAR_PLACEMENT = CALENDAR_PLACEMENT;

  timeZone = DateUtils.getTimeZone();
  startTime: string = '00:00';
  endTime: string = '23:59';

  loading: boolean = false;

  error = {
    startDate: EMPTY,
    endDate: EMPTY
  };


  formGroup: FormGroup = this.fb.group({
    merchantGroupName: [EMPTY, Validators.required],
    merchantGroupType: [EMPTY, Validators.required],
    merchantGroupId: [EMPTY],
    startDate: [undefined, Validators.required],
    endDate: [undefined, Validators.required],
    communityCode: [EMPTY, Validators.required],
    merchantDetails: [[]],
    merchantAcquirerDetails: [[]]
  });

  get isAllUpdateRequest(): boolean {
    return !((this.formGroup.value?.merchantDetails?.length > 0) || (this.formGroup.value?.merchantAcquirerDetails?.length > 0));
  }

  get formValue(): any {
    return this.formGroup.getRawValue();
  }
  constructor(
    private dialogRef: MatDialogRef<UpdateDateModalComponent>,
    private fb: UntypedFormBuilder,
    private http: HttpService,
    private formService: FormService,
    private alertService: ToggleAlertService,
    private merchantGroupService: MerchantGroupService,
    @Inject(MAT_DIALOG_DATA) private dialogConfig: any
  ) { }

  private preparePayload(): any {
    const payload = this.formGroup.getRawValue();

    payload.startDate = this.convertTimeZone(payload.startDate, this.startTime);
    payload.endDate = this.convertTimeZone(payload.endDate, this.endTime);

    return payload;
  }

  ngOnInit(): void {
    this.formGroup.patchValue(this.dialogConfig);
    console.log(this.dialogConfig);

  }

  ngAfterViewInit(): void {
    this.formService.clearFormControlValidators(this.formGroup);
  }

  getFormData(key: 'startDate' | 'endDate') {
    return this.formGroup.get(key)!;
  }

  checkDate(e: any, date: 'startDate' | 'endDate') {
    this.error[date] = e == null ? 'Invalid Value' : '';
  }

  setTime(e: Event, type: 'sTime' | 'eTime') {
    const value = (e.target as HTMLInputElement).value;

    type == 'sTime' ? (this.startTime = value) : (this.endTime = value);
  }

  convertTimeZone(date: string, time: string) {
    return DateUtils.formatDateTime((moment(
      ` ${DateUtils.formatDateTime(date, DateTimeFormat.MOMENT_YYYY_MM_DD)} ${time}`
    ).utc()), DateTimeFormat.MOMENT_YYYY_MM_DD_TIME);
  }
  private handleResponse(response: any): void {
    this.loading = false;

    if ((response?.statusCode === SUCCESS_CODE) && Utils.isNull(response?.errors)) {
      this.alertService.showSuccessMessage('Merchant successfully updated.');

      this.close({ status: 'updated' });
    } else {
      this.alertService.showResponseErrors(response?.errors);
    }
  }

  private updateAllMerchants(): void {
    const formVal = this.preparePayload();

    const payload = new FormData();
    payload.append('merchantGroupName', formVal.merchantGroupName);
    payload.append('merchantGroupType', formVal.merchantGroupType);
    payload.append('communityCode', formVal.communityCode);
    payload.append('startDate', formVal.startDate);
    payload.append('endDate', formVal.endDate);

    this.http.put(
      'api/merchantgroup/updateEffectiveDateRangeForAllActiveMerchants',
      payload
    ).subscribe({
      next: (res: any) => this.handleResponse(JSON.parse(res.body)),
      error: err => this.loading = false
    });
  }

  private updateSelectedMerchants(): void {

    this.merchantGroupService.updateSelectedMerchantDates(this.preparePayload())
      .subscribe({
        next: (response: any) => this.handleResponse(response),
        error: err => this.loading = false,
        complete: () => this.loading = false
      });
  }

  save() {
    this.loading = true;

    if (this.isAllUpdateRequest) {
      this.updateAllMerchants();
    } else {
      this.updateSelectedMerchants();
    }
  }

  close(obj?: object) {
    this.dialogRef.close(obj);
  }
}
