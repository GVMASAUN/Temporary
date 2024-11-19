import { Component, OnInit, OnChanges, OnDestroy, Input, Output, EventEmitter, Self, Optional, ViewContainerRef, SimpleChanges } from "@angular/core";
import { ControlValueAccessor, NgControl } from "@angular/forms";
import { ButtonIconType } from "@visa/vds-angular";
import { Observable, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { EMPTY, VisaIcon, VisaImage } from "src/app/core/constants";
import { Option } from "src/app/core/models/option.model";
import { GarbageCollectorService } from "src/app/services/garbage-collector.service";

@Component({
  selector: "app-shuttle-box",
  templateUrl: "./shuttle-box.component.html",
  styleUrls: ["./shuttle-box.component.scss"]
})

export class ShuttleBoxComponent implements ControlValueAccessor, OnInit, OnChanges, OnDestroy {
  @Input()
  placeholder!: string;

  @Input()
  error: string = EMPTY;

  @Input()
  isRequired!: boolean;

  @Input()
  disabled!: boolean;

  @Input()
  locked: boolean = false;

  @Input()
  selectable: boolean = true;

  @Input()
  searchable: boolean = true;

  @Input()
  autoSelect: boolean = true;

  @Input()
  options: Array<Option> = [];

  @Input()
  value: Array<any> = [];

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

  ButtonIconType = ButtonIconType;
  VisaIcon = VisaIcon;
  VisaImage = VisaImage;


  availableSearch: string = EMPTY;
  selectedSearch: string = EMPTY;

  originalValue: Array<any> = this.value;
  currentAvailableOptions: Array<Option> = [];
  currentSelectedOptions: Array<Option> = [];

  onChange = (value: any) => { };
  onTouched = () => { };

  get availableOptions(): Option[] {
    return (this.options || [])
      .filter(
        item => !(this.value || []).find(val => this.equal(val, item.value)) &&
          item.label
            .toLowerCase()
            .includes(this.availableSearch.toLocaleLowerCase())
      ).sort(this.sort);
  }

  get selectedOptions(): Option[] {
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

  private selectOption(option: Option): void {
    if (
      this.optionSelectable(option) &&
      !this.value.find(item => this.equal(item, option.value))
    ) {
      this.value = [...this.value, option.value];
      this.changeValue(this.value);
    }
  }

  private unselectOption(option: Option): void {
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


  ngOnInit(): void { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["options"]) {
      if (this.options && (this.options.length === 1) && (this.autoSelect === true)) {
        setTimeout(() => {
          this.writeValue(this.options[0].value);
        });
      }
    }
  }

  availableClick(option: Option): void {
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

  selectedClick(option: Option): void {
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

  selectCurrent(options: Array<Option> = this.currentAvailableOptions): void {
    options.map(option => this.selectOption(option));

    this.currentAvailableOptions = [];
    this.currentSelectedOptions = [];
  }

  selectAll(): void {
    this.options.map(option => this.selectOption(option));

    this.currentAvailableOptions = [];
    this.currentSelectedOptions = [];
  }

  unselectCurrent(options: Array<Option> = this.currentSelectedOptions): void {
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

  unselectAll(): void {
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


  changeValue(value: any): void {
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

  writeValue(value: any): void {
    this.originalValue = value;
    this.changeValue(value);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.disabled = disabled;
  }

  optionSelectable(option: Option): boolean {
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

  optionTrackBy(index: number, option: Option): string {
    return EMPTY.concat(index.toString(), option.label);
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

