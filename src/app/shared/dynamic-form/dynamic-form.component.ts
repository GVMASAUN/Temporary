import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewContainerRef } from "@angular/core";
import { FormField, FormFieldDependency, FormFieldType } from "./dynamic-form.model";
import { CustomFormGroup, FormBuilder, FormService } from "src/app/services/form-service/form.service";
import { ASTERISK, DateTimeFormat, EMPTY, VALIDATION_FAIL_ERROR, VisaIcon, VisaImage } from "src/app/core/constants";
import { Option } from "src/app/core/models/option.model";
import { AbstractControl, ValidatorFn, Validators } from "@angular/forms";
import { ButtonIconType, ComboboxType } from "@visa/vds-angular";
import { Utils } from "src/app/services/utils";
import { Observable, Subject, distinctUntilChanged, takeUntil } from "rxjs";
import { GarbageCollectorService } from "src/app/services/garbage-collector.service";
import { ToggleAlertService } from "src/app/services/toggle-alert/toggle-alert.service";

@Component({
    selector: 'app-dynamic-form',
    templateUrl: './dynamic-form.component.html',
    styleUrls: ['./dynamic-form.component.scss']
})
export class DynamicFormComponent implements OnInit, OnChanges, OnDestroy {
    private destroy$ = new Subject<void>();

    @Input()
    errorMessages: any = {};

    @Input()
    formFields: ReadonlyArray<FormField> = [];

    FormFieldType = FormFieldType;
    ButtonIconType = ButtonIconType;
    DateFormat = DateTimeFormat;
    VisaIcon = VisaIcon;
    VisaImage = VisaImage;
    ComboBoxType = ComboboxType;

    searchSelectMenuOpened: boolean = false
    initializeForm: boolean = false;

    dynamicForm: CustomFormGroup<unknown> = this.formBuilder.group({});




    constructor(
        private formBuilder: FormBuilder,
        private viewContainerRef: ViewContainerRef,
        private formService: FormService,
        private alertService: ToggleAlertService
    ) { }

    private getFieldValidations(field: FormField): Array<ValidatorFn> | null {
        if (Utils.isNotNull(field.validations)) {
            if (field.validations instanceof Function) {
                return field.validations(this.dynamicForm, field);
            } else {
                return field.validations!;
            }
        } else {
            return [];
        }
    }

    private getInitialControlValue(field: FormField): string | never[] | null {
        if (field.value) {
            return field.value;
        }
        return field.options ? [] : null;
    }

    private initializeDynamicForm(): void {
        this.dynamicForm = this.formBuilder.group(
            this.formFields.reduce(
                (acc, val) => ({
                    ...acc,
                    [val.key]: this.getInitialControlValue(val)
                }),
                {}
            ),
        );
        this.initializeForm = true;

        setTimeout(() => {
            this.formService.clearFormControlValidators(this.dynamicForm);
        }, 50);
    }

    private validateParentDependencies(validationDependencies: Array<FormFieldDependency>): boolean {
        return validationDependencies.every((dependency: FormFieldDependency) => {
            return this.dynamicForm.get(dependency.parentFieldKey)?.value !== null;
        });
    }

    private validateDependencies(formField: FormField): boolean {
        return (
            (Utils.isNull(formField.fieldDependencies)) ||
            (
                Utils.isNotNull(formField.fieldDependencies) &&
                this.validateParentDependencies(formField.fieldDependencies!)
            )
        );
    }

    private getFormValidationMap(): Map<AbstractControl | null, ValidatorFn | Array<ValidatorFn> | null> {

        const formValidationMap = new Map<AbstractControl | null, ValidatorFn | Array<ValidatorFn> | null>();

        this.formFields.forEach((field: FormField) => {
            if (Utils.isNotNull(field.validations) &&
                !(field.hidden && field.hidden!(field, this)) &&
                !(field.disable && field.disable!(field, this)) &&
                this.validateDependencies(field)
            ) {
                formValidationMap.set(this.dynamicForm.get(field.key), this.getFieldValidations(field));
            } else {
                formValidationMap.set(this.dynamicForm.get(field.key), null);
            }
        });

        return formValidationMap;
    }

    private setFieldOptions(field: FormField): void {
        if (field.options instanceof Observable) {

            field.options.pipe(takeUntil(this.destroy$)).subscribe({
                next: options => {
                    field.options = Utils.sortOptions(options);
                    this.dynamicForm.get(field.key)?.patchValue(field.value);
                },
                error: err => {
                    console.log(err);
                }
            });
        } else {
            field.options = Utils.sortOptions(field.options!);
        }
    }

    private registerOnChangeListener(): void {
        this.formFields.forEach((field: FormField) => {
            if (!!field.onChange) {
                this.dynamicForm.get(field.key)?.valueChanges
                    .pipe(takeUntil(this.destroy$), distinctUntilChanged())
                    .subscribe({
                        next: (changedValue: any) => {
                            field.onChange!(changedValue, this.dynamicForm, this);
                        }
                    })
            }
        });
    }

    ngOnInit(): void {
        this.initializeDynamicForm();
        this.registerOnChangeListener();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['formFields']) {
            this.formFields.map(field => {
                if (field.type === FormFieldType.DROPDOWN || field.type === FormFieldType.SEARCH_SELECT) {
                    this.setFieldOptions(field);
                }
            });

            this.initializeDynamicForm();
            this.registerOnChangeListener();
        }
    }

    formFieldTrackBy(index: number, item: FormField): string {
        return index.toString().concat(item.key);
    }

    getSpanClass(field: FormField): string {
        if (field.fieldSpan) {
            return `span-${field.fieldSpan}`;
        }
        return EMPTY;
    }

    getFieldLabel(field: FormField): string {
        if (this.isRequiredField(field)) {
            return field.label.concat(ASTERISK);
        }
        return field.label;
    }

    isRequiredField(field: FormField): boolean {
        const validations = this.getFieldValidations(field);
        if (!!validations && validations.some((validation: ValidatorFn) => (validation === Validators.required))) {
            return true;
        }
        return false;
    }

    getOptionList(formField: FormField): Array<Option> {
        if (formField.options instanceof Array) {
            return formField.options
        }
        return [];
    }

    getDynamicFormValue(): any {
        const valid = this.formService.validate(this.getFormValidationMap());

        if (valid) {
            return this.dynamicForm.getRawValue();
        } else {
            this.alertService.showError(VALIDATION_FAIL_ERROR);
        }


        return null;
    }

    getErrorMessage(control: AbstractControl): string {
        return this.formService.getFormControlErrorMessage(
            this.dynamicForm,
            control,
            this.errorMessages
        );
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();

        GarbageCollectorService.clearDetachedDOMElements(
            this,
            this.viewContainerRef,
            true
        );
    }
}