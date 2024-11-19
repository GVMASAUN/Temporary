import { Injectable } from '@angular/core';
import { SortDirection } from 'src/app/shared/search-table/search-table.model';
import { Store } from './store.service';
import { Page } from 'src/app/core/models/pagination-response.model';

export interface SearchTableState {
  searchFilters?: { [key: string]: any };
  sortActive?: string;
  sortDirection?: SortDirection;
  page?: Page;
  pageNumber?: number;
  pageSize?: number;
  totalElements?: number;
  shownColumns?: string[];
}

export class State {
  searchTableState: {
    [key: string]: SearchTableState
  } = {}
}

@Injectable({
  providedIn: 'root'
})
export class AppStoreService extends Store<State> {

  constructor(
  ) {
    super(new State());

    this.state$.subscribe(state => {
      sessionStorage.setItem('app', JSON.stringify(state));
    });
  }

  setSearchTableState(name: string, searchFilters: SearchTableState) {
    this.setState(
      {
        ...this.state,
        searchTableState: {
          ...this.state.searchTableState,
          [name]: {
            ...this.state.searchTableState[name],
            ...searchFilters
          }
        }
      }
    );
  }

  getSearchTableState(name: string): SearchTableState {
    return this.state.searchTableState[name] || {}
  }

  clearSearchTableState() {
    this.setState(
      {
        ...this.state,
        searchTableState: {
        }
      }
    );
  }
}
