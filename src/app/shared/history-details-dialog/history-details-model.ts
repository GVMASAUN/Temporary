import { SearchTableColumn } from "src/app/shared/search-table/search-table.model";

export class HistoryDetailsDialogConfig {
    data: any;
    dialogTitle!: string;
    dataSource!: any;

    viewConfigs!: Array<ViewConfig>;
    columns!: Array<SearchTableColumn>;
}

export class ViewConfig {
    key!: string;
    label!: string;

    mapValue?: (data: any) => any = () => { };
}