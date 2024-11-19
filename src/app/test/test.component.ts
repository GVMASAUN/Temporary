import { Component, OnInit } from '@angular/core';
import { SearchTableColumn, SearchTableColumnType } from '../components/search-table/search-table.model';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss']
})
export class TestComponent implements OnInit {
  headerData: Array<SearchTableColumn> = [
    {
      key: 'communityName',
      label: 'ClientName',
      hidden: false,
      sortable: true,
      type: SearchTableColumnType.LINK
    },
    {
      key: 'communityDescription',
      label: 'Description',
      hidden: false,
      sortable: false,
      type: SearchTableColumnType.DEFAULT
    },
    {
      key: 'serviceStartDate',
      label: 'Effective',
      hidden: false,
      sortable: true,
      type: SearchTableColumnType.DATE
    },
    { 
      key: 'isActive',
      label: 'Status',
      hidden: false,
      sortable: true,
      type: SearchTableColumnType.STATUS
    }
  ];
  tableHeader: SearchTableColumn[] = this.headerData;
  isLoading: boolean = false;

  constructor(private http: HttpClient) { }

  getTableData(filters:any = {}): Observable<any> {
    const param = {
      page: filters.pageIndex,
      size: filters.pa
    }
    return this.http.get('visa-loyalty-suite-api/api/community/listClientCommunities');
  }

  ngOnInit(): void {
  }

}
