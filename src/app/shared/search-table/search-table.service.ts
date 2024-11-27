import { Injectable } from '@angular/core';
import { AMPERSAND, COMMA, DEFAULT_PAGE_SIZE, ZERO } from 'src/app/core/constants';
import { Utils } from 'src/app/services/utils';
import { SearchTableColumn, SortDirection } from './search-table.model';
import { FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class SearchTableService {

  constructor() { }

  public prepareSearchParams(
    params: any,
    sortMapping?: { [key: string]: string },
    makeCustomPayload: boolean = false
  ): string {
    const sort = params.sort || {};
    let payloadParams: any = {};

    if (makeCustomPayload) {
      const sortDirection: SortDirection = sort?.sortDirection;

      payloadParams = {
        sortBy: sortMapping![sort?.sortActive] || sort?.sortActive,
        sortOrder: sortDirection.toUpperCase(),
        pageSize: params?.size || DEFAULT_PAGE_SIZE,
        pageNumber: params?.page || ZERO,
        ...params
      };

      delete payloadParams?.sort;
      delete payloadParams?.size;
      delete payloadParams?.page;
    } else {
      payloadParams = {
        page: ZERO,
        size: DEFAULT_PAGE_SIZE,
        ...params,
        ...(Utils.isNotNull(params.sort)
          ? {
            sort: `${sortMapping !== undefined
              ? sortMapping[sort.sortActive] || sort.sortActive : sort.sortActive
              }${COMMA}${sort.sortDirection}`
          }
          : {})
      };
    }


    return Object.entries(payloadParams)
      .filter(([key, value]) => Utils.isNotNull(value))
      .map(([key, value]) => `${key}=${value}`)
      .join(AMPERSAND);
  }

  public sortArray(
    value: Array<any>,
    sortField: string,
    direction: SortDirection = SortDirection.ASC,
    column: SearchTableColumn | null = null
  ): Array<any> {
    return value.sort((a, b) => {
      const isFormGroupInstance: boolean = ((a instanceof FormGroup) && (b instanceof FormGroup));

      let aSort = isFormGroupInstance ? a.value[sortField] : a[sortField];
      let bSort = isFormGroupInstance ? b.value[sortField] : b[sortField];

      if(column?.mapValue){
        aSort = column.mapValue(a,undefined!);
        bSort = column.mapValue(b,undefined!);
      }

      return Utils.compareFields(aSort,bSort,direction);
    });
  }
}
