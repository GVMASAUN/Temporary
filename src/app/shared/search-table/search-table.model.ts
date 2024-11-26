import { TemplateRef } from "@angular/core";
import { ValidatorFn } from "@angular/forms";
import { ButtonColor, CALENDAR_PLACEMENT } from "@visa/vds-angular";
import { Observable } from "rxjs";
import { VisaIcon } from "src/app/core/constants";
import { Option } from "src/app/core/models/option.model";
import { SearchTableComponent } from "./search-table.component";

export enum SearchTableColumnType {
    TEMPLATE,
    LINK,
    DATE,
    GMT_DATE,
    STATUS,
    ICON,
    BADGE,
    SERIAL_NUMBER,
    EMAIL,
    DEFAULT
}

export enum SearchFieldType {
    INPUT,
    SEARCH_SELECT,
    DROPDOWN,
    DATE,
    GMT_DATE,
    CHECKBOX,
    CUSTOM,
    TIME,
    RADIO,
    TEXT_AREA,
    NUMBER
}

export enum SortDirection {
    ASC = 'asc',
    DESC = 'desc',
    DEFAULT = ''
};

export enum SortType {
    STATIC = 'static',
    DYNAMIC = 'dynamic'
}

export enum PaginationSizeValue {
    PAGINATION_SIZE_10 = 10,
    PAGINATION_SIZE_20 = 20,
    PAGINATION_SIZE_50 = 50,
    PAGINATION_SIZE_100 = 100
}

export const SORT_DIRECTION_ICON = {
    [SortDirection.ASC]: VisaIcon.SORTABLE_ASCENDING,
    [SortDirection.DESC]: VisaIcon.SORTABLE_DESCENDING,
    [SortDirection.DEFAULT]: VisaIcon.SORTABLE
};

export const SORT_DIRECTION_DESC = {
    [SortDirection.ASC]: 'Sort Ascending',
    [SortDirection.DESC]: 'Sort Descending',
    [SortDirection.DEFAULT]: 'Sort'
};


export class SearchFieldDependency {
    parentField!: string;
    searchKey?: string;
    isMandatory?: boolean;
}

export class SearchTableColumn {
    key!: string;
    sortKey?: string;
    label?: string;
    headerStyle?: string;

    hidden?: boolean;
    fixed?: boolean;
    sortable?: boolean;
    sticky?: boolean;
    showStatusIcon?: boolean;

    type?: SearchTableColumnType;
    sortDirection?: SortDirection;

    columnTemplateRef?: TemplateRef<any>;

    click?: (row: any, table: SearchTableComponent) => void;
    cellStyle?: (row: any, table: SearchTableComponent) => any;
    mapValue?: (row: any, table: SearchTableComponent) => any;
    icon?: (row: any, table: SearchTableComponent) => VisaIcon;
    tooltip?: (row: any) => string;
}

export class SearchField {
    key!: string;
    label!: string;
    dateFormat?: string;

    disableReset?: boolean;
    showOnReset?: boolean;
    disableOnChange?: boolean;

    type?: SearchFieldType;
    optionsSortOrder?: SortDirection;
    calenderPlacement?: CALENDAR_PLACEMENT = CALENDAR_PLACEMENT.FLEXIBLE;

    options?: Array<Option> | Observable<Array<Option>>;
    searchDependencies?: Array<SearchFieldDependency>;

    templateRef?: TemplateRef<any>;

    searchOptions?: (queryString: string, params: any) => Observable<Array<Option>>;
    fullWidth?: boolean;
    validators?: ValidatorFn | Array<ValidatorFn>;
    validationError?: { [key: string]: string; };

    constructor(
        key: string,
        label: string,
        type?: SearchFieldType,
        options?: Array<Option>,
        dateFormat?: string,
        disableReset?: boolean,
        searchDependencies?: Array<SearchFieldDependency>,
        searchOptions?: (queryString: string, params: any) => Observable<Array<Option>>,
        templateRef?: TemplateRef<any>
    ) {
        this.key = key;
        this.label = label;
        this.type = type;
        this.options = options;
        this.dateFormat = dateFormat;
        this.disableReset = disableReset;
        this.searchDependencies = searchDependencies;
        this.searchOptions = searchOptions;
        this.templateRef = templateRef;
    }
}

export class SearchTableAction {
    label!: string;

    buttonColor!: ButtonColor;

    click?: (table: SearchTableComponent) => void;
    disabled?: (table: SearchTableComponent) => boolean;
    hidden?: (table: SearchTableComponent) => boolean;
}

export class Action {
    label!: string;

    disabled?: boolean;
    hidden?: boolean;

    click?: (table: SearchTableComponent) => void;
}

export class RowAction {
    icon?: string;

    disabled?: boolean;
    hidden?: boolean;

    actionList?: Action[] = [];

    click?: (row: any, table: SearchTableComponent) => void;
    tooltip?: (table: SearchTableComponent) => string;
}