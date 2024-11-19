import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Optional,
  Output,
  Self,
  SimpleChanges,
  ViewContainerRef
} from "@angular/core";

import {
  ControlValueAccessor,
  NgControl
} from "@angular/forms";
import { Observable, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { EMPTY } from "src/app/core/constants";
import { Option } from "src/app/core/models/option.model";
import { GarbageCollectorService } from "src/app/services/garbage-collector.service";

@Component({
  selector: "app-shuttle-box",
  templateUrl: "./shuttle-box.component.html",
  styleUrls: ["./shuttle-box.component.scss"]
})

export class ShuttleBoxComponent
  implements ControlValueAccessor, OnInit, OnChanges, OnDestroy {
  @Input()
  placeholder!: string;

  @Input()
  isRequired!: boolean;

  @Input()
  options: Array<Option> = [];

  @Input()
  value: Array<any> = [];

  @Input()
  error = EMPTY;

  @Input()
  disabled!: boolean;

  @Input()
  selectable = true;

  @Input()
  searchable = true;

  @Input()
  autoSelect = true;

  @Input()
  unselectable: Function = () => true;

  @Input()
  sort: (a: Option, b: Option) => number = (a, b) =>
    a.label.localeCompare(b.label);

  @Input()
  rowStyle: Function = () => { };

  @Output()
  change: EventEmitter<any> = new EventEmitter<any>();

  private destroy$ = new Subject<void>();

  get availableOptions() {
    return (this.options || [])
      .filter(
        item => !(this.value || []).find(val => this.equal(val, item.value)) &&
          item.label
            .toLowerCase()
            .includes(this.availableSearch.toLocaleLowerCase())
      ).sort(this.sort);
  }

  get selectedOptions() {
    return (this.options || [])
      .filter(item =>
        (this.value || []).find(val => this.equal(val, item.value)) &&
        item.label
          .toLowerCase()
          .includes(this.selectedSearch.toLocaleLowerCase())
      ).sort(this.sort);
  }

  constructor(
    @Self()
    @Optional()
    public ngControl: NgControl,
    private viewContainerRef: ViewContainerRef
  ) {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  originalValue = this.value;

  availableSearch = EMPTY;
  selectedSearch = EMPTY;

  currentAvailableOptions: Array<Option> = [];
  currentSelectedOptions: Array<Option> = [];



  onChange = (value: any) => { };
  onTouched = () => { };

  ngOnInit() { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["options"]) {
      if (this.options && (this.options.length === 1) && (this.autoSelect === true)) {
        setTimeout(() => {
          this.writeValue(this.options[0].value);
        });
      }
    }
  }

  handleSearchInputChange(value: any) {

  }

  availableClick(option: Option) {
    if (this.optionSelectable(option)) {
      const index = this.currentAvailableOptions.findIndex(
        item => item === option
      );
      if (index >= 0) {
        this.currentAvailableOptions = [
          ...this.currentAvailableOptions.slice(0, index),
          ...this.currentAvailableOptions.slice(index + 1)
        ];
      } else {
        this.currentAvailableOptions = [
          ...this.currentAvailableOptions,
          option
        ];
      }
    }
  }

  selectedClick(option: Option) {
    if (this.optionSelectable(option)) {
      const index = this.currentSelectedOptions.findIndex(
        item => item === option
      );
      if (index >= 0) {
        this.currentSelectedOptions = [
          ...this.currentSelectedOptions.slice(0, index),
          ...this.currentSelectedOptions.slice(index + 1)
        ];
      } else {
        this.currentSelectedOptions = [...this.currentSelectedOptions, option];
      }
    }
  }

  selectCurrent(options: Array<Option> = this.currentAvailableOptions) {
    options.map(option => this.selectOption(option));

    this.currentAvailableOptions = [];
    this.currentSelectedOptions = [];
  }

  selectAll() {
    this.options.map(option => this.selectOption(option));

    this.currentAvailableOptions = [];
    this.currentSelectedOptions = [];
  }

  unselectCurrent(options: Array<Option> = this.currentSelectedOptions) {
    const callback = (result: any) => {
      if (result) {
        options.map(option => this.unselectOption(option));
        this.currentAvailableOptions = [];
        this.currentSelectedOptions = [];
      }
    };
    const unselectable = this.unselectable(
      this.currentAvailableOptions.map(item => item.value)
    );
    if (unselectable instanceof Observable) {
      unselectable.pipe(takeUntil(this.destroy$)).subscribe(callback);
    } else {
      callback(unselectable);
    }
  }

  unselectAll() {
    const callback = (result: any) => {
      if (result) {
        this.options.map(option => this.unselectOption(option));
        this.currentAvailableOptions = [];
        this.currentSelectedOptions = [];
      }
    };
    const unselectable = this.unselectable(this.value || []);
    if (unselectable instanceof Observable) {
      unselectable.pipe(takeUntil(this.destroy$)).subscribe(callback);
    } else {
      callback(unselectable);
    }
  }

  private selectOption(option: Option) {
    if (
      this.optionSelectable(option) &&
      !this.value.find(item => this.equal(item, option.value))
    ) {
      this.value = [...this.value, option.value];
      this.changeValue(this.value);
    }
  }

  private unselectOption(option: Option) {
    if (this.optionSelectable(option)) {
      const index = this.value.findIndex(item =>
        this.equal(item, option.value)
      );
      if (index >= 0) {
        this.value = [
          ...this.value.slice(0, index),
          ...this.value.slice(index + 1)
        ];

        this.changeValue(this.value);
      }
    }
  }

  changeValue(value: any) {
    value = value ? (Array.isArray(value) ? value : [value]) : [];
    this.value = value;
    this.onChange(value);
    this.change.emit(value);
    // if (CustomFunctions.equal(this.originalValue, this.value)) {
    //   if (this.ngControl && this.ngControl.control) {
    //     this.ngControl.control.markAsPristine();
    //   }
    // }
  }

  writeValue(value: any) {
    this.originalValue = value;
    this.changeValue(value);
  }

  registerOnChange(fn: any) {
    this.onChange = fn;
  }

  registerOnTouched(fn: any) {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean) {
    this.disabled = disabled;
  }

  optionSelectable(option: Option) {
    return (
      option && !this.disabled && this.selectable && option && !option.disabled
    );
  }

  equal(value: Option, option: Option): boolean {

    if (value === option) {
      return true;
    }
    if (!!value && !!option) {
      if (Array.isArray(value) && Array.isArray(option)) {
        return JSON.stringify(value) === JSON.stringify(option);
      }

      if (typeof value === "object" && typeof option === "object") {
        return JSON.stringify(value) === JSON.stringify(option);
      }
    }

    return false;
  }

  optionTrackBy(index: number, option: Option) {
    return EMPTY + index + option.label;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    GarbageCollectorService.clearDetachedDOMElements(
      this,
      this.viewContainerRef
    );
  }
}

