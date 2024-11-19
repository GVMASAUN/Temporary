import { Observable } from "rxjs/internal/Observable";
import { Option } from "src/app/core/models/option.model";
import { DynamicFormComponent } from "./dynamic-form.component";
import { ValidatorFn } from "@angular/forms";
import { DateTimeFormat } from "src/app/core/constants";
import { TemplateRef } from "@angular/core";
import { CustomFormGroup } from "src/app/services/form-service/form.service";

export enum FieldSpan {
    ONE = 1,
    TWO,
    THREE,
    FOUR,
    FIVE,
    SIX,
    SEVEN,
    EIGHT,
    NINE,
    TEN,
    ELEVEN,
    TWELVE
}

export enum FormFieldType {
    DROPDOWN,
    SEARCH_SELECT,
    RADIO_GROUP,
    DATE,
    INPUT_NUMBER,
    DEFAULT,
    CHECKBOX,
    TIME,
    INPUT,
    TEXTAREA,
    CUSTOM
}

export class FormFieldDependency {
    parentFieldKey!: string;
    isMandatory?: boolean;
}

export class FormField {
    key!: string;
    label!: string;
    value?: any;
    labelHintTooltip?: string;


    type?: FormFieldType;
    dateFormat?: DateTimeFormat;
    fieldSpan?: FieldSpan;

    templateRef?: TemplateRef<any>;

    validations?: Array<ValidatorFn> | ((form: CustomFormGroup<unknown>, field: FormField) => Array<ValidatorFn>);
    options?: Array<Option> | Observable<Array<Option>>;
    fieldDependencies?: Array<FormFieldDependency>;

    fieldStyle?: (field: FormField, component: DynamicFormComponent) => any;
    hidden?: (field: FormField, component: DynamicFormComponent) => boolean;
    disable?: (field: FormField, component: DynamicFormComponent) => boolean;
    onChange?: (value: any, form: CustomFormGroup<unknown>, component: DynamicFormComponent) => void;
}