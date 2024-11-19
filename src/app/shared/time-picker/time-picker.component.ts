import { Component, OnInit, OnChanges, Self, Optional, ContentChild, TemplateRef, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import * as moment from 'moment';
import { DateTimeFormat, EMPTY } from 'src/app/core/constants';
import { DateUtils } from 'src/app/services/util/dateUtils';
import { Utils } from 'src/app/services/utils';

/**
 * A custom time picker component that provides time selection functionality.
 * This component supports various formatting options and can be used with Angular Forms.
 */
@Component({
  selector: 'app-time-picker',
  templateUrl: './time-picker.component.html',
  styleUrls: ['./time-picker.component.scss']
})
export class TimePickerComponent implements ControlValueAccessor, OnInit, OnChanges {
  constructor(
    @Self()
    @Optional()
    public ngControl: NgControl
  ) {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  @ContentChild("placeholderSuffix")
  placeholderSuffix!: TemplateRef<any>;

  /** Indicates whether the entered time is invalid. */
  @Input() invalid: boolean = false;

  /** The desired format for displaying and parsing the time. */
  @Input() format: DateTimeFormat = DateTimeFormat.HH_MM_SS;

  /** Placeholder text to display when no time is selected. */
  @Input() placeholder: string = 'Time';

  /** The selected time value. */
  @Input()
  value: string = EMPTY;

  /** Indicates whether the time picker is disabled. */
  @Input() disabled: boolean = false;

  /** Indicates whether the time selection is required. */
  @Input() isRequired: boolean = false;

  /** Indicates whether the time should be set to the minimum time (00:00:00). */
  @Input() min: boolean = false;

  /** Indicates whether the time should be set to the maximum time (23:59:59). */
  @Input() max: boolean = false;

  /** The step interval for time selection, based on the format. */
  @Input() step: number = 1;

  /** Event emitter for time change events. */
  @Output() timeChangeEmitter: EventEmitter<string> = new EventEmitter<string>();

  /** Callback function to propagate value changes to the form. */
  onChange = (value: any) => { };

  ngOnInit(): void {
    // Set the default time based on min/max settings or provided value
    this.setDefaultTime();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.setDefaultTime();
  }

  /** Write a new value to the form model. */
  writeValue(value: any): void {
    this.value = value;
  }

  /** Register a callback function to be called when the value changes. */
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  /** Register a callback function to be called when the component is blurred. */
  registerOnTouched(fn: any): void {
  }

  /** Handle the change event when the time value is modified. */
  handleTimeChange(event: any): void {
    if (this.ngControl) {
      const value = DateUtils.formatDateTime(event.target.value, this.format);

      this.value = value;

      this.onChange(value);
    } else {
      this.timeChangeEmitter.emit(event.target.value);
    }
  }

  /** Handle the change event for keydown. */
  handleKeyEvents(event: any): void {
    if (event.keyCode === 8 || event.code === 'Backspace') {
      event.preventDefault();
    }
  }

  /** Set the appropriate step value based on the format. */
  private setStepValue(): void {
    switch (this.format) {
      case DateTimeFormat.HH_MM_SS_SSS:
        this.step = 0.1;
        break;
      case DateTimeFormat.HH_MM:
        this.step = 0;
        break;
      default:
        this.step = 1;
        break;
    }
  }

  private setDefaultTime(): void {
    if (this.min || this.max) {
      const defaultTime = this.min
        ? DateUtils.formatDateTime(moment().startOf('day'), this.format)
        : DateUtils.formatDateTime(moment().endOf('day'), this.format);

      this.value = defaultTime;
    } else {
      this.value = DateUtils.formatDateTime(this.value, this.format);
    }
    this.setStepValue();
    this.onChange(this.value);
  }
}
