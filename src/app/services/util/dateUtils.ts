import * as moment from 'moment';
import * as moment_timezone from 'moment-timezone';
import { DateTimeFormat, EMPTY } from 'src/app/core/constants';

export class DateUtils {
    private static RESERVED_DATE_TIME_FORMATS = [
        DateTimeFormat.HH_MM,
        DateTimeFormat.HH_MM_SS,
        DateTimeFormat.HH_MM_SS_SSS,
        DateTimeFormat.MM_DD_YYYY_HH_MM_A,
        DateTimeFormat.MOMENT_MM_DD_YYYY_HH_MM_A,
        DateTimeFormat.MM_DD_YYYY,
        DateTimeFormat.MOMENT_YYYY_MM_DD,
        DateTimeFormat.MOMENT_YYYY_MM_DD_TIME,
        DateTimeFormat.YYYY_MM_DD_HH_MM_SS
      ];

      public static convertUTCDateTimeToLocalDateTime(
        dateTime: Date | string,
        format = DateTimeFormat.MOMENT_YYYY_MM_DD_TIME,
        sourceFormat: string | string[] = this.RESERVED_DATE_TIME_FORMATS
      ): string {
        if (!!dateTime) {
          return moment
            .utc(dateTime, sourceFormat)
            .local()
            .format(format);
        }
    
        return EMPTY;
      }
    
      public static convertLocalDateTimeToUTCDateTime(
        dateTime: Date | string,
        format = DateTimeFormat.MOMENT_YYYY_MM_DD_TIME,
        sourceFormat: string | string[] = this.RESERVED_DATE_TIME_FORMATS
      ): string {
        if (dateTime) {
          return moment.utc(moment(dateTime, sourceFormat)).format(format);
        }
    
        return EMPTY;
      }
    
      public static formatDateTime(
        dateTime: moment.MomentInput,
        format: DateTimeFormat | string = DateTimeFormat.MOMENT_YYYY_MM_DD_TIME,
        sourceFormat: string | string[] = this.RESERVED_DATE_TIME_FORMATS
      ): string {
        if (!!dateTime) {
          return moment(dateTime, sourceFormat).format(format);
        }
    
        return EMPTY;
      }
    
      public static getTimeZone(): string {
        return moment_timezone()
          .tz(moment_timezone.tz.guess())
          .format('z');
      }
    
      public static dateRangeValidator(startDate: null | string | Date, endDate: null | string | Date, validateSame: boolean = false) {
        let isDateValid = true;
    
        const momentStartDate = moment(startDate, DateTimeFormat.MOMENT_YYYY_MM_DD_TIME);
        const momentEndDate = moment(endDate, DateTimeFormat.MOMENT_YYYY_MM_DD_TIME);
    
        if (momentEndDate.isBefore(momentStartDate)) {
          isDateValid = false;
        }
    
        if (!validateSame && momentEndDate.isSame(momentStartDate)) {
          isDateValid = false
        }
    
        return isDateValid;
      }
}