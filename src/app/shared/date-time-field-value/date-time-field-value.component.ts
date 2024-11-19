import { Component, Input } from '@angular/core';
import { DateTimeFormat, EMPTY, TimeZone } from 'src/app/core/constants';
import { DateUtils } from 'src/app/services/util/dateUtils';

@Component({
  selector: 'app-date-time-field-value',
  templateUrl: './date-time-field-value.component.html',
  styleUrls: ['./date-time-field-value.component.scss']
})
export class DateTimeFieldValueComponent {
  @Input()
  value: any;

  @Input()
  convertToLocal: boolean = true;

  @Input()
  styleClass: any = EMPTY;

  DateFormatEnum = DateTimeFormat;
  TimeZoneEnum = TimeZone;

  protected formatDate(date: Date | string, format: DateTimeFormat, convertToLocal: boolean = false): string {
    return convertToLocal
      ? DateUtils.convertUTCDateTimeToLocalDateTime(date, format)
      : DateUtils.formatDateTime(date, format);
  }

  protected getTimeZone(): string {
    return DateUtils.getTimeZone();
  }
}
