import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewContainerRef } from "@angular/core";
import { FormTableAction, FormTableColumn, FormTableColumnType, RowAction, ValidationDependency } from "./form-table.model";
import { CustomFormGroup, FormBuilder, FormService } from "src/app/services/form-service/form.service";
import { AbstractControl, FormArray, FormGroup, ValidatorFn, Validators } from "@angular/forms";
import { DateTimeFormat, EMPTY, INVALID_ENTRY, VisaIcon } from "src/app/core/constants";
import { Utils } from "src/app/services/utils";
import { SelectionModel } from "@angular/cdk/collections";
import { ButtonColor, ButtonIconType } from "@visa/vds-angular";
import { GarbageCollectorService } from "src/app/services/garbage-collector.service";
import { SORT_DIRECTION_DESC, SORT_DIRECTION_ICON, SortDirection } from "../search-table/search-table.model";
import { DateUtils } from "src/app/services/util/dateUtils";

@Component({
    selector: 'app-form-table',
    templateUrl: './form-table.component.html',
    styleUrls: ['./form-table.component.scss']
})
export class FormTableComponent implements OnInit, AfterViewInit, OnDestroy {
    @Input()
    dataSource: any = null;

    @Input()
    errorMessages: any;

    @Input()
    tableId: string = 'Form-Table';

    @Input()
    hideSelectAll: boolean = false;

    @Input()
    canSelectMultipleRow: boolean = true;

    @Input()
    isDynamicTable: boolean = false;

    @Input()
    columns: ReadonlyArray<FormTableColumn> = [];

    @Input()
    rowActions: ReadonlyArray<RowAction> = [];

    @Input()
    tableActions: ReadonlyArray<FormTableAction> = [];

    FormTableColumn = FormTableColumn;
    FormTableColumnType = FormTableColumnType;
    DateFormate = DateTimeFormat;
    ButtonColor = ButtonColor;
    ButtonIconType = ButtonIconType;
    VisaIcon = VisaIcon;
    SortDirection = SortDirection;
    INVALID_ENTRY = INVALID_ENTRY;

    caption: string = EMPTY;

    showTable: boolean = false;

    selection: SelectionModel<any> = new SelectionModel<any>(
        this.canSelectMultipleRow
    );

    advanceTableForm: CustomFormGroup<unknown> = this.formBuilder.group({
        formArray: this.formBuilder.array([])
    });

    get formArray(): FormArray {
        return this.advanceTableForm.get('formArray') as FormArray;
    }

    constructor(
        private formBuilder: FormBuilder,
        private formService: FormService,
        private viewContainerRef: ViewContainerRef
    ) { }

    private fillFormArrayWithDataSource(): void {
        this.dataSource.forEach((data: any) => {
            this.addFromGroupToFormArray(data);
        });
    }

    private init(): void {
        if (Utils.isNotNull(this.dataSource)) {
            this.fillFormArrayWithDataSource();
        }
        this.showTable = true;
    }

    private getInitialControlValue(data: any, value: string, column: any): string | null {

        if (Utils.isNotNull(data)) {
            return (column.mapValue && column.mapValue(data, this)) || data[value];
        }
        return null;
    }

    private validateParentDependencies(validationDependencies: Array<ValidationDependency>, formGroup: CustomFormGroup<unknown>): boolean {
        return validationDependencies.every((dependency: ValidationDependency) => {
            return formGroup.get(dependency.parentColumnKey)?.value !== null;
        });
    }

    private validateDependencies(column: FormTableColumn, formGroup: CustomFormGroup<unknown>): boolean {
        return (
            (Utils.isNull(column.validationDependencies)) ||
            (
                Utils.isNotNull(column.validationDependencies) &&
                this.validateParentDependencies(column.validationDependencies!, formGroup)
            )
        );
    }

    private addValidationToFormGroup(formGroup: CustomFormGroup<unknown>, formValidationMap: Map<AbstractControl | null, ValidatorFn | Array<ValidatorFn> | null>): void {

        this.columns.forEach((column: FormTableColumn) => {
            if ((Utils.isNotNull(column.validations)) && this.validateDependencies(column, formGroup)) {
                formValidationMap.set(formGroup.get(column.key), column.validations!);
            } else {
                formValidationMap.set(formGroup.get(column.key), null);
            }
        });
    }

    private getFormArrayValidationMap(): Map<AbstractControl | null, ValidatorFn | Array<ValidatorFn> | null> {

        const formValidationMap = new Map<AbstractControl | null, ValidatorFn | Array<ValidatorFn> | null>();

        formValidationMap.set(this.advanceTableForm.get('formArray'),
            [Validators.required]
        );

        for (let index = 0; index < this.formArray.length; index++) {
            const formGroup = this.formArray.at(index) as CustomFormGroup<unknown>;

            this.addValidationToFormGroup(formGroup, formValidationMap);
        }

        return formValidationMap;
    }

    private getSelectionValidationMap(): Map<AbstractControl | null, ValidatorFn | Array<ValidatorFn> | null> {
        const formValidationMap = new Map<AbstractControl | null, ValidatorFn | Array<ValidatorFn> | null>();

        this.selection.selected.forEach((formGroup: CustomFormGroup<unknown>) => {
            this.addValidationToFormGroup(formGroup, formValidationMap);
        });

        return formValidationMap;
    }

    private resetRowFormFields(row: AbstractControl): void {
        let formGroup = row as FormGroup;

        Object.entries(formGroup.controls).forEach(([controlKey, control]) => {
            if (!control.pristine || Utils.isNotNull(control.errors)) {
                control.reset();
                control.setErrors(null);
            }
        });
    }

    ngOnInit(): void {
        this.init();
    }

    ngAfterViewInit(): void {
        this.caption = Utils.generateCaptionMessage(this.columns, this.tableId);
    }

    isAllSelected(): boolean {
        const totalRowsSelected = this.selection.selected.length;
        const totalRows = this.dataSource.length;

        return (totalRowsSelected === totalRows);
    }

    masterToggle(event: Event): void {
        const validClick = (event.target as HTMLInputElement).classList.contains(
            'vds-checkbox'
        );

        if (validClick) {
            this.isAllSelected() ?
                this.selection.clear() :
                this.formArray.controls.forEach((row: AbstractControl<any, any>) => this.selection.select(row));
        }
    }

    columnTrackBy(index: number, item: FormTableColumn): string {
        return index.toString().concat(item.key);
    }

    rowTrackBy(index: number, item: AbstractControl<any, any>): string {
        return index.toString().concat(item.value);
    }

    getTimeZone(): string {
        return DateUtils.getTimeZone();
    }

    getSortDirectionIcon(sortDirection: SortDirection): VisaIcon {
        return SORT_DIRECTION_ICON[sortDirection];
    }

    getSortDirectionDesc(sortDirection: SortDirection): string {
        return SORT_DIRECTION_DESC[sortDirection];
    }

    handleRowSelection(event: any, row: AbstractControl): void {
        if (event?.checked || (!event.source.checked && event?.value)) {
            if (!this.canSelectMultipleRow) {
                this.selection.clear();
            }

            this.selection.select(row);
        } else {
            this.resetRowFormFields(row);
            this.selection.deselect(row);
        }
    }

    isRowDisabled(row: any): boolean {
        return !this.selection.isSelected(row);
    }

    sort(column: FormTableColumn): void {
        const sortDirection = column.sortDirection || SortDirection.DEFAULT;

        if (sortDirection === SortDirection.DEFAULT) {
            column.sortDirection = SortDirection.ASC;
        } else if (sortDirection === SortDirection.ASC) {
            column.sortDirection = SortDirection.DESC;
        } else if (sortDirection === SortDirection.DESC) {
            column.sortDirection = SortDirection.ASC;
        }

        this.columns.forEach(col => {
            if (col.key !== column.key) {
                col.sortDirection = SortDirection.DEFAULT;
            }
        });

        Utils.sortArray(this.formArray.controls, column.key, column.sortDirection || SortDirection.ASC);
    }

    addFromGroupToFormArray(data: any = null): void {
        const newFormGroup = this.formBuilder.group(
            this.columns.reduce(
                (acc, val) => ({
                    ...acc,
                    [val.key]: this.getInitialControlValue(data, val.key, val)
                }),
                {
                    key: ""
                }
            )
        );

        this.formArray.push(newFormGroup);
    }

    removeFormGroup(rowIndex: number): void {
        this.formArray.removeAt(rowIndex);
    }

    getFormArrayValues(): any {
        const valid = this.formService.validate(this.getFormArrayValidationMap());

        if (valid) {
            return this.formArray.value;
        }
        return null;
    }

    getSelectedFormArrayValues(): any {
        const valid = this.formService.validate(this.getSelectionValidationMap());

        if (valid) {
            return this.selection.selected.map(formGroup => formGroup.value);
        }
        return null;
    }

    getErrorMessage(formGroup: CustomFormGroup<any>, control: AbstractControl): string {
        return this.formService.getFormControlErrorMessage(
            formGroup,
            control,
            this.errorMessages
        );
    }

    ngOnDestroy(): void {

        GarbageCollectorService.clearDetachedDOMElements(
            this,
            this.viewContainerRef,
            true
        );
    }
}