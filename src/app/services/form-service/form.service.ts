import { Injectable } from '@angular/core';
import { AbstractControl, AbstractControlOptions, FormArray, UntypedFormBuilder, UntypedFormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { EMPTY, INVALID_ENTRY, REQUIRED_FIELD } from 'src/app/core/constants';
import { ResponseError } from 'src/app/core/models/pagination-response.model';
import { Utils } from '../utils';


export interface CustomFormGroup<T> extends UntypedFormGroup {
  value: T;

  controls: {
    [key in keyof T]: AbstractControl;
  };
}






export class CustomValidator {
  // It validates if control's value contains only space(s)
  public static noWhiteSpace(control: AbstractControl): ValidationErrors | null {
    const value: any = control.value;

    if (Utils.isNotNull(value) && !String(value).trim().length) {
      return { required: true };
    }

    return null;
  }
}



@Injectable({
  providedIn: 'root'
})
export class FormBuilder extends UntypedFormBuilder {
  constructor() {
    super();
  }

  override group<T>(
    controlsConfig: {
      [key: string]: any;
    },
    options?: AbstractControlOptions | null | undefined
  ): CustomFormGroup<T> {
    return super.group(controlsConfig, options) as CustomFormGroup<T>;
  }
}




@Injectable({
  providedIn: 'root'
})
export class FormService {

  constructor() { }

  public setResponseErrors(responseErrors: ResponseError[], formGroup: UntypedFormGroup) {
    if (Utils.isNotNull(responseErrors)) {
      responseErrors.forEach(err => {
        const control = formGroup.get(err.targetId);

        control?.setErrors({ ...(control.errors || {}), invalid: true });
      });
    }
  }

  public prepareErrorObject(responseErrors: ResponseError[]) {
    const errorObject: any = {};

    if (Utils.isNotNull(responseErrors)) {
      responseErrors
        // .filter(err => Utils.isNotNull(err.targetId))
        .forEach(err => {
          errorObject[err.targetId] = {
            invalid: err.errorMessage
          }
        });
    }

    return errorObject;
  }



  public getFormControlErrorMessage(
    formGroup: UntypedFormGroup,
    fromControl: string | AbstractControl,
    additionalErrors: { [key: string]: { [key: string]: string } | string } = {}
  ): string {
    const errors: any = {
      default: {
        required: REQUIRED_FIELD,
        MinRequired: INVALID_ENTRY
      },
      ...additionalErrors
    };

    const formControlName: string = this.getFormControlName(fromControl) || EMPTY;

    if (Utils.isNotNull(formControlName)) {
      const control = formGroup.get(formControlName);
      const errorMessageList: any = errors;
      const errorObject = errorMessageList[formControlName] || {};

      const errorMessage =
        errorObject[Object.keys(errorObject).find(key => control?.errors && control.errors[key]) || EMPTY]
        ||
        errorMessageList.default[(Object.keys(errorMessageList?.default).find(key => control?.errors && control.errors[key]) || EMPTY)]
        ||
        errorMessageList[(Object.keys(errorMessageList).find(key => control?.errors && control.errors[key]) || EMPTY)]
        ||
        EMPTY;


      if (errorMessage instanceof Function) {
        return errorMessage(control?.value);
      }
      return errorMessage;
    } else {
      return EMPTY;
    }

  }

  public clearFormControlValidators(formGroup: UntypedFormGroup | FormArray): void {
    Object.keys(formGroup.controls).forEach(formControl => {
      const control = formGroup.get(formControl);

      if (control instanceof UntypedFormGroup || control instanceof FormArray) {
        this.clearFormControlValidators(control);
      } else {
        control?.clearValidators();
        control?.updateValueAndValidity();
      }
    });
  }


  public validate(formValidationMap: Map<AbstractControl | null, ValidatorFn | Array<ValidatorFn> | null>): boolean {
    if (Utils.isNull(formValidationMap)) {
      return true;
    }


    formValidationMap.forEach((validator, control, map) => {
      control?.setValidators(validator ?? []);
      control?.markAsTouched();
      control?.updateValueAndValidity({ emitEvent: false });
    });

    if (Array.from(formValidationMap.keys()).reduce((acc, val) => acc && !val?.invalid, true)) {
      return true;
    } else {
      return false;
    }
  }


  public updateValidations(formValidationMap: Map<AbstractControl | null, ValidatorFn | Array<ValidatorFn> | null>): void {
    formValidationMap.forEach((validator, control, map) => {
      control?.updateValueAndValidity({ emitEvent: false });
    });
  }



  public getFormControlName(control: AbstractControl | string): string | null {
    if (typeof control === 'string') {
      return control;
    }

    if (!!control) {
      const group = <UntypedFormGroup>control?.parent;
      const keys: string[] = Object.keys(group?.controls);

      for (let index = 0; index < keys.length; index++) {
        const key: string = keys[index];
        const childControl = group.get(key);

        if (childControl === control) {
          return key;
        }
      }
    }

    return null;
  }
}
