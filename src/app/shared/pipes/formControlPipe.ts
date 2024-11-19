import { Pipe, PipeTransform } from "@angular/core";
import { AbstractControl, UntypedFormArray, UntypedFormControl, UntypedFormGroup } from "@angular/forms";

@Pipe({
    name: 'controlConverter',
})
export class ControlConverterPipe implements PipeTransform {
    transform(control: AbstractControl, type: 'formGroup' | 'formArray' | 'formControl' = 'formControl'): any {
        if (type === 'formGroup') {
            return control as UntypedFormGroup;
        }
        if (type === 'formArray') {
            return control as UntypedFormArray;
        }

        return control as UntypedFormControl;
    }

}