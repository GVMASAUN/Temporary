import { Component, Input, OnInit } from '@angular/core';
import { Observable, map } from 'rxjs';
import { PaginationResponse } from 'src/app/core/models/pagination-response.model';
import { EpmTemplateService } from 'src/app/services/epm-template/epm-template.service';
import { EpmTemplate, EpmTemplateField, EpmTemplateHistory } from '../../epm-template.model';
import { UntypedFormGroup } from '@angular/forms';
import { SearchField, SearchFieldType, SearchTableColumn, SearchTableColumnType } from 'src/app/shared/search-table/search-table.model';
import { Option } from 'src/app/core/models/option.model';
import { ANY, COMMA_PATTERN, EMPTY, NEWLINE, SPACE } from 'src/app/core/constants';
import { User } from 'src/app/pages/users/user.model';

@Component({
  selector: 'app-epm-template-history',
  templateUrl: './epm-template-history.component.html',
  styleUrls: ['./epm-template-history.component.scss']
})
export class EpmTemplateHistoryComponent implements OnInit {
  @Input()
  epmTemplateForm!: UntypedFormGroup;

  tableColumns: SearchTableColumn[] = [
    {
      key: 'historyMessages',
      label: 'Changes Made',
      fixed: true,
      sortable: false,
      cellStyle: () => {
        return 'white-space: pre-line;'
      },
      mapValue: (row) => {
        if (row.historyMessages) {
          return row.historyMessages.map((message: string) => message.replace(COMMA_PATTERN, EMPTY)).join(`${NEWLINE}${NEWLINE}`);
        }
      }
    },
    {
      key: 'modifiedUserFullName',
      label: 'Responsible User',
      sortable: false,
      cellStyle: () => {
        return 'width: 20%'
      }
    },
    {
      key: 'modifiedDate',
      label: 'Modification Date',
      type: SearchTableColumnType.DATE,
      sortable: false,
      cellStyle: () => {
        return 'width: 20%'
      }
    }
  ];

  advancedSearchFields!: SearchField[];

  get epmTemplate(): EpmTemplate {
    return this.epmTemplateForm.getRawValue() as EpmTemplate;
  }

  constructor(
    private epmTemplateService: EpmTemplateService,
  ) { }

  private getHistoryUsersList(): Observable<Array<Option>> {
    const params = {
      communityCode: this.epmTemplate[EpmTemplateField.TEMPLATE_COMMUNITY_CODE],
      id: this.epmTemplate[EpmTemplateField.TEMPLATE_MESSAGE_ID],
    };

    return this.epmTemplateService.getHistoryUsers(params)
    .pipe(
      map((paginationResponse: PaginationResponse<Array<User>>) => {
        const usersArray: User[] = paginationResponse.data || [];

        const optionsArray: Option[] = usersArray.map((user: User) => {
          const userFullName = user.firstName?.concat(SPACE,user.lastName!);
          return new Option(user.volId, userFullName!);
        });
        optionsArray.unshift(new Option(EMPTY,ANY));
        return optionsArray;
      })
    );
  }

  ngOnInit(): void {
    this.advancedSearchFields = [
      {
        key: 'modifiedUserId',
        label:'Responsible User',
        type: SearchFieldType.DROPDOWN,
        options: this.getHistoryUsersList()
      },
      {
        key: 'modificationStartDate',
        label:'Action Start Date',
        type: SearchFieldType.DATE,
      },
      {
        key: 'modificationEndDate',
        label:'Action End Date',
        type: SearchFieldType.DATE,
      }
    ];
  }

  getTemplateHistory(filters: any = {}): Observable<PaginationResponse<EpmTemplateHistory>> {
    const params = {
      communityCode: this.epmTemplate[EpmTemplateField.TEMPLATE_COMMUNITY_CODE],
      id: this.epmTemplate[EpmTemplateField.TEMPLATE_MESSAGE_ID],
      ...filters
    }
    return this.epmTemplateService.getEpmTemplateHistroy(params);
  }

}
