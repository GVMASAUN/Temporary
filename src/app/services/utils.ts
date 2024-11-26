import { ANY, EMPTY, LABEL, SPACE } from '../core/constants';
import { SearchTableComponent } from '../shared/search-table/search-table.component';
import { SearchTableColumn, SortDirection } from '../shared/search-table/search-table.model';
import { FormGroup } from '@angular/forms';
import { Option } from "src/app/core/models/option.model";

export class Utils {


  public static isNotNull(value: any) {
    const type = typeof value;

    if (value === null || value === undefined) {
      return false;
    } else if (
      (type === 'string' || Array.isArray(value)) &&
      value.length <= 0
    ) {
      return false;
    }

    return true;
  }

  public static isNull(value: any) {
    return !this.isNotNull(value);
  }

  public static generateId(): string {
    const length = 8;
    const timestamp = +new Date();
    const ts = timestamp.toString();
    const parts = ts.split(EMPTY).reverse();
    let id = EMPTY;

    for (let i = 0; i < length; ++i) {
      const index = Utils.getRandomInt(0, parts.length - 1);
      id += parts[index];
    }

    return id;
  }

  public static generateNumberId(): number {
    return Number(Utils.generateId());
  }

  public static getRandomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  public static sortArray(
    value: Array<any>,
    sortField: string,
    direction: SortDirection = SortDirection.ASC,
    mapValue?: (row: any, table: SearchTableComponent) => any
  ): Array<any> {
    return value.sort((a, b) => {
      let order = 0;

      const isFormGroupInstance: boolean = ((a instanceof FormGroup) && (b instanceof FormGroup));

      const aSort = isFormGroupInstance ? a.value[sortField] : a[sortField];
      const bSort = isFormGroupInstance ? b.value[sortField] : b[sortField];

      // if(mapValue !== null){
      //   aSort = mapValue(value,)
      // }

      if ((typeof aSort === 'string') && (typeof bSort === 'string')) {
        order = aSort.trim().localeCompare(bSort.trim());
      } else if (isNaN(aSort) || isNaN(bSort)) {
        order = aSort > bSort ? 1 : aSort < bSort ? -1 : 0;
      } else {
        order = aSort - bSort;
      }

      return direction === SortDirection.ASC ? order : -order;
    });
  }

  public static titleCase(text: any) {
    text = text.toLowerCase().split(SPACE);
    for (let i = 0; i < text.length; i++) {
      text[i] = text[i].charAt(0).toUpperCase() + text[i].slice(1);
    }

    return text.join(SPACE);
  }

  public static isNumber(value: any) {
    return !Number.isNaN(Number(value));
  }

  public static generateCaptionMessage(columns: any, tableId: string) {
    let caption;

    if (columns && columns.length > 4) {
      const columnNames = columns.map((column: { label: any; }, index: number) => `column ${index + 1} ${column.label}`);
      caption = `${tableId} - ${columnNames.join(' - ')}`;
    } else {
      caption = tableId;
    }

    return caption;
  }

  public static downloadFile(data: any): void {
    let blob = new Blob([data.body], { type: 'text/csv' });
    let fileName: string = data.headers
      .get('content-disposition')
      .split('=')
      .pop();
    let downloadLink = document.createElement('a');
    downloadLink.href = window.URL.createObjectURL(blob);
    downloadLink.setAttribute('download', fileName);
    downloadLink.click();
  }

  public static sortOptions(options: Array<Option>, sortDirection?: SortDirection) {
    if (!!options) {
      const optionAny = options.find(option => option.label === ANY);

      const sortedOptions = Utils.sortArray(options.filter(option => option.label !== ANY), LABEL, sortDirection);

      if (!!optionAny) {
        sortedOptions.unshift(optionAny);
      }

      return sortedOptions;
    }

    return options;
  }

  public static isMinNumber(source: any, target: any): boolean {
    return BigInt(source || EMPTY) < BigInt(target || EMPTY);
  }
}
