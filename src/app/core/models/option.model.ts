import { EMPTY } from "../constants";

export class Option {
  value: any;
  label: string = EMPTY;
  disabled?: boolean;
  rawValue?: any;

  constructor(value: any, label: string, rawValue?: any, disabled?: boolean) {
    this.value = value;
    this.label = label;
    this.rawValue = rawValue;
    this.disabled = disabled;
  }
}
