import { ValidatorFn } from "@angular/forms";
import { FormTableComponent } from "./form-table.component";
import { ButtonColor } from "@visa/vds-angular";
import { SortDirection } from "../search-table/search-table.model";
import { VisaIcon } from "src/app/core/constants";

export enum FormTableColumnType {
    DATE_TIME_INPUT,
    INPUT,
    DEFAULT
}

export class ValidationDependency {
    parentColumnKey!: string;
}

export class FormTableColumn {
    key!: string;
    label?: string;
    sortable?: boolean;
    sticky?: boolean;
    sortDirection?: SortDirection;
    type?: FormTableColumnType
    validations?: Array<ValidatorFn>;
    validationDependencies?: Array<ValidationDependency>;

    cellStyle?: (row: any, table: FormTableComponent) => any = () => { };
    mapValue?: (row: any, table: FormTableComponent) => any = () => { };
    disable?: (row: any, component: FormTableComponent) => boolean = () => { return false };
}

export class RowAction {
    label!: string;
    icon!: VisaIcon;
    disabled?: boolean;
    hidden?: boolean;

    click?: (rowIndex: number, table: FormTableComponent) => void = () => { };
}

export class FormTableAction {
    label!: string;
    buttonColor!: ButtonColor;

    click?: (table: FormTableComponent) => void = () => { };
    disabled?: (table: FormTableComponent) => boolean = () => { return false };
    hidden?: (table: FormTableComponent) => boolean = () => { return false };
}