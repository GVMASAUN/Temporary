import { SelectionModel } from '@angular/cdk/collections';
import { HttpStatusCode } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild, ViewContainerRef } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, ValidatorFn } from '@angular/forms';
import { BadgeType, ButtonColor, ButtonIconType, ComboboxType, PageEvent, TooltipPosition } from '@visa/vds-angular';
import { cloneDeep, isEmpty, isEqual } from 'lodash';
import * as moment from 'moment';
import { Observable, Subject, Subscription, of } from 'rxjs';
import { distinctUntilChanged, map, takeUntil } from 'rxjs/operators';
import { COMMA, DateTimeFormat, EMPTY, TimeZone, VisaIcon } from 'src/app/core/constants';
import { Option } from 'src/app/core/models/option.model';
import { Page, PaginationResponse } from 'src/app/core/models/pagination-response.model';
import { STATUS_BADGE_TYPE, STATUS_DESC, STATUS_ICON, StatusCode, StatusDesc } from 'src/app/core/models/status.model';
import { FormService } from 'src/app/services/form-service/form.service';
import { GarbageCollectorService } from 'src/app/services/garbage-collector.service';
import { NavStatusService } from 'src/app/services/nav-status/nav-status.service';
import { AppStoreService, SearchTableState } from 'src/app/services/stores/app-store.service';
import { ToggleAlertService } from 'src/app/services/toggle-alert/toggle-alert.service';
import { DateUtils } from 'src/app/services/util/dateUtils';
import { Utils } from 'src/app/services/utils';
import { PanelAction } from '../panel/panel.model';
import { PaginationSizeValue, RowAction, SORT_DIRECTION_DESC, SORT_DIRECTION_ICON, SearchField, SearchFieldType, SearchTableAction, SearchTableColumn, SearchTableColumnType, SortDirection, SortType } from './search-table.model';
import { SearchTableService } from './search-table.service';

@Component({
  selector: 'app-search-table',
  templateUrl: './search-table.component.html',
  styleUrls: ['./search-table.component.scss'],
})
export class SearchTableComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  handleDateChange(dateString: string, field: SearchField) {
    if (field.validators && dateString && !moment(dateString, field.dateFormat || DateTimeFormat.MOMENT_MM_DD_YYYY, true).isValid()) {
      this.advancedSearchForm.controls[field.key].setErrors({ invalid: 'invalid' });
    } else {
      this.advancedSearchForm.controls[field.key].setErrors(null);
    }
  }


  @ViewChild('toggle')
  toggle!: ElementRef;

  @ViewChild('menu')
  menu!: ElementRef;

  @Input()
  sorting: SortType = SortType.STATIC;

  @Input()
  sortActive: string = EMPTY;

  @Input()
  sortActiveDirection: SortDirection = SortDirection.ASC;

  @Input()
  notFound: string = "No matches found.";

  @Input()
  tableId: string = 'Search-Table';

  @Input()
  moreColumns: boolean = true;

  @Input()
  isLoading: boolean = false;

  @Input()
  hidePagination: boolean = false;

  @Input()
  hidePaginationSizeFilter: boolean = true;

  @Input()
  hideSelectAll: boolean = false;

  @Input()
  hideSearchFieldFilters: boolean = false;

  @Input()
  canSelectMultipleRow: boolean = true;

  @Input()
  resetSort: boolean = false;

  @Input()
  persistSearchFilters: boolean = false;

  @Input()
  initSearch: boolean = true;

  @Input()
  showClearFilterButton: boolean = true;

  @Input()
  defaultPageSize: PaginationSizeValue = PaginationSizeValue.PAGINATION_SIZE_50;

  @Input()
  tableStyle: any = EMPTY;

  @Input()
  columns: Array<SearchTableColumn> | ReadonlyArray<SearchTableColumn> = [];

  @Input()
  tableActions: Array<SearchTableAction> | ReadonlyArray<SearchTableAction> = [];

  @Input()
  rowActions: Array<RowAction> | ReadonlyArray<RowAction> = [];

  @Input()
  selectedRowActions: Array<SearchTableAction> | ReadonlyArray<SearchTableAction> = [];

  @Input()
  dataSource: Array<any> = [];

  @Input()
  searchFields: Array<SearchField> | ReadonlyArray<SearchField> = [];

  @Input()
  paginationSizeOptions: Array<Option> = [
    {
      value: PaginationSizeValue.PAGINATION_SIZE_10,
      label: PaginationSizeValue.PAGINATION_SIZE_10.toString()
    },
    {
      value: PaginationSizeValue.PAGINATION_SIZE_20,
      label: PaginationSizeValue.PAGINATION_SIZE_20.toString()
    },
    {
      value: PaginationSizeValue.PAGINATION_SIZE_50,
      label: PaginationSizeValue.PAGINATION_SIZE_50.toString()
    },
    {
      value: PaginationSizeValue.PAGINATION_SIZE_100,
      label: PaginationSizeValue.PAGINATION_SIZE_100.toString()
    }
  ];

  @Input()
  search!: (searchFilters: any) => Observable<PaginationResponse<any>> | null;

  @Input()
  disabledSearch: boolean = false;

  @Output()
  searchFilterResetEmitter: EventEmitter<unknown> = new EventEmitter();
  @Output()
  validationPerformedEmitter: EventEmitter<unknown> = new EventEmitter();

  advancedSearchForm: UntypedFormGroup = this.formBuilder.group({});

  ButtonColor = ButtonColor;
  ButtonIconType = ButtonIconType;
  ComboboxType = ComboboxType;
  TooltipPosition = TooltipPosition;
  BadgeType = BadgeType;
  SearchTableColumnType = SearchTableColumnType;
  SearchFieldType = SearchFieldType;
  SortDirection = SortDirection;
  DateFormat = DateTimeFormat;
  VisaIcon = VisaIcon;
  TimeZone = TimeZone;

  STATUS_DESC = STATUS_DESC;
  STATUS_ICON = STATUS_ICON;
  STATUS_BADGE_TYPE = STATUS_BADGE_TYPE;
  SORT_DIRECTION_ICON = SORT_DIRECTION_ICON;
  SORT_DIRECTION_DESC = SORT_DIRECTION_DESC;


  private parentSearchFieldMap = new Map<string, Array<string>>();
  private previousSearchFilters: any = {};
  private destroy$ = new Subject<void>();
  private advancedSearchFormSubscriptions: Array<Subscription> = new Array<Subscription>();

  panelActions: PanelAction[] = [
    {
      label: 'SEARCH',
      buttonColor: ButtonColor.PRIMARY,
      disabled: () => this.advancedSearchForm?.invalid || this.disabledSearch,
      click: () => {
        this.searchRecords();
      }
    },
    {
      label: 'RESET',
      buttonColor: ButtonColor.SECONDARY,
      click: () => {
        this.reset();
      }
    }
  ];

  selection: SelectionModel<any> = new SelectionModel<any>(
    this.canSelectMultipleRow
  );

  page: Page = new Page(0, 50, 50);

  openedMenu: number = -1;
  panelSection: number = 0;
  selectedPageIndex: number = 0;
  selectedPageSize: number = this.defaultPageSize;
  totalElements: number = 0;

  isPanelOpen: boolean = false;
  isNavOpen: boolean = false;
  searchActivate: boolean = false;
  menuOpen: boolean = false;
  initializeForm: boolean = false;
  searchSelectOpen = false;

  caption: string = EMPTY;

  tableData: any[] = [];
  shownColumns: string[] = [];

  @HostListener('document:click', ['$event'])
  blurEvent(event: any) {
    let classList: string[] = [];
    let pathName = event.composedPath();

    pathName.pop();
    pathName.pop();
    pathName.map((val: any) => {
      let arr = val?.getAttribute('class')?.split(' ');
      if (arr) {
        arr.map((i: string) => {
          classList.push(i);
        });
      }
    });
    if (classList.includes('ignore-host-blur')) {
      return;
    }
    this.openedMenu = -1;
  }

  @HostListener('document:keydown.enter', ['$event'])
  onEnterKey(event: KeyboardEvent) {
    if (this.isPanelOpen) {
      const focusedElement = document.activeElement;

      // Check if the focused element is a button
      if (focusedElement instanceof HTMLButtonElement) {
        return; // Allow default behavior for the focused button
      }

      event.preventDefault();
      this.searchRecords();
    }
  }

  constructor(
    private status: NavStatusService,
    private formBuilder: UntypedFormBuilder,
    private viewContainerRef: ViewContainerRef,
    private alertService: ToggleAlertService,
    private readonly appStoreService: AppStoreService,
    private readonly formService: FormService,
    private searchTableService: SearchTableService
  ) {
    this.status.getPanelStatus.pipe(takeUntil(this.destroy$)).subscribe({
      next: panelStatus => {
        if (this.isPanelOpen) {
          this.searchActivate = true;
        }
        this.isPanelOpen = panelStatus;
      }
    });
  }


  private initSearchForm(): void {
    this.advancedSearchForm = this.formBuilder.group(
      this.searchFields.reduce(
        (acc, val) => ({
          ...acc,
          [val.key]: val.options ? [] : null
        }),
        {
          key: EMPTY,
          label: EMPTY
        }
      ),
      {
        formArray: false
      }
    );

    // for (const field of this.searchFields) {
    //   if (field.validators) {
    //     this.advancedSearchForm.controls[field.key].setValidators(field.validators);
    //   }
    // }

    this.initializeForm = true;
  }

  private setFieldOptions(field: SearchField): void {
    if (field.options instanceof Observable) {
      const options$ = field.options;
      field.options = [];

      options$.pipe(takeUntil(this.destroy$)).subscribe(options => {
        field.options = Utils.sortOptions(options, field.optionsSortOrder);
      });
    } else {
      field.options = field.options && Utils.sortOptions(field.options, field.optionsSortOrder);
    }
  }

  private prepareDependentFieldMap(field: SearchField): void {
    if (field) {
      const childSearchFields = this.searchFields
        .filter(
          searchField =>
            !!searchField.searchDependencies &&
            searchField.searchDependencies.some(
              searchDependency => searchDependency.parentField === field.key
            )
        )
        .map(searchField => searchField.key);

      if (!!childSearchFields && childSearchFields.length) {
        this.parentSearchFieldMap.set(field.key, childSearchFields);
      }
    }
  }

  private handleDependentSearchFields(): void {
    this.searchFields.forEach(field => {
      if (this.parentSearchFieldMap.has(field.key)) {
        const fieldFormControl = this.advancedSearchForm.get(field.key);

        if (fieldFormControl) {
          fieldFormControl.valueChanges
            .pipe(takeUntil(this.destroy$))
            .subscribe(value => {
              const parentFormControl = this.advancedSearchForm.get(field.key);
              const dependentFieldKeys = this.parentSearchFieldMap.get(field.key);

              if (dependentFieldKeys) {
                dependentFieldKeys.forEach(childFieldKey => {
                  const childField = this.searchFields.find(
                    searchField => searchField.key === childFieldKey
                  );
                  const childFieldFormControl = this.advancedSearchForm.get(childFieldKey);


                  if (childField) {
                    const dependentField = (childField.searchDependencies || []).find(
                      d => d.parentField === field.key
                    );
                    const isMandatoryDependentField = (!!dependentField && dependentField.isMandatory === true);

                    if (
                      parentFormControl
                      &&
                      (Utils.isNotNull(parentFormControl.value) || isMandatoryDependentField === false)
                      //  &&
                      // !(parentFormControl.touched || parentFormControl.dirty)
                    ) {
                      if (Utils.isNotNull(childField.searchOptions)) {

                        this.searchOptions(
                          childField,
                          this.getSearchFieldControlValue(parentFormControl.value, field)
                        ).pipe(takeUntil(this.destroy$)).subscribe((res: Option[]) => {
                          childField.options = [...res];

                          childFieldFormControl?.reset(null, { onlySelf: true, emitEvent: false });
                          childFieldFormControl?.updateValueAndValidity();
                        });
                      }
                    } else {
                      childField.options = [];

                      if (childFieldFormControl) {
                        childFieldFormControl.reset(null, { onlySelf: true, emitEvent: false });
                      }
                    }
                  }
                });
              }
            });
        }
      }
    });
  }

  private searchOptions(searchField: SearchField, queryString: string): any {
    if (!searchField) {
      return;
    }

    const searchParams: any = {};
    let hasAllMandatoryFields: boolean = true;

    if (searchField.searchDependencies && Utils.isNotNull(searchField.searchDependencies)) {
      searchField.searchDependencies.forEach(searchDependency => {
        const parentFormControl = this.advancedSearchForm.get(
          searchDependency.parentField
        );

        if (parentFormControl && Utils.isNotNull(parentFormControl.value)) {
          const searchKey =
            searchDependency.searchKey || searchDependency.parentField;
          searchParams[searchKey] = parentFormControl.value;
        } else if (searchDependency.isMandatory) {
          hasAllMandatoryFields = false;
        }
      });
    }

    if (!hasAllMandatoryFields) {
      return of([]);
    }

    const searchOption = searchField.searchOptions;

    if (searchOption) {
      return searchOption(queryString, searchParams).pipe(map(options => {
        searchField.options = Utils.sortOptions(options, searchField.optionsSortOrder);

        return searchField.options;
      }));
    }
  }

  private handleValueChanges(value: any, field: SearchField): void {
    if (!field.disableOnChange) {
      value = this.getSearchFieldControlValue(value, field);

      if (((value !== null) || (value === EMPTY)) && this.searchActivate) {
        setTimeout(() => {
          this.performSearch(0);
        }, 100);
      }
    }
  }

  private getSortParams(): any {
    const column = this.columns.find(col => !!col.sortDirection && col.sortDirection.toString() !== SortDirection.DEFAULT);

    if (column) {
      return ({
        sortActive: column.key,
        sortDirection: column.sortDirection
      });
    }

    return null;
  }

  private sortTableData(data: any[], column: SearchTableColumn): any[] {
    if (this.persistSearchFilters) {
      this.appStoreService.setSearchTableState(this.tableId, {
        ...this.getSortParams() // Recording sorting params
      });
    }

    return this.searchTableService.sortArray(
      data,
      column.sortKey || column.key,
      column.sortDirection,
      column
    );
  }

  private performStaticPagination(): void {
    if (!this.hidePagination) {
      this.selectedPageIndex = Number(this.selectedPageIndex);
      const startIndex = this.selectedPageIndex * this.selectedPageSize;
      const endIndex = startIndex + this.selectedPageSize;

      this.dataSource = this.tableData.slice(startIndex, endIndex);

      if ((this.dataSource.length === 0) && this.tableData.length) {
        this.selectedPageIndex = this.selectedPageIndex - 1;

        this.performStaticPagination();
      }
    }
  }

  private getSearchFieldControlValue(value: any, searchField: SearchField): any {
    if (
      [
        SearchFieldType.SEARCH_SELECT,
        SearchFieldType.CUSTOM
      ].includes(searchField.type!) &&
      (typeof value === 'object') &&
      (value !== null)
    ) {
      return value.value;
    }

    return value;
  }

  private handleOnDataSourceChange(): void {
    if (this.sorting === SortType.STATIC) {
      const sortColumn = this.columns.find(c => c.key === this.sortActive);

      if (sortColumn) {
        this.dataSource = this.sortTableData(this.dataSource, sortColumn);
      }

      if (this.hidePagination === false) {
        this.tableData = this.dataSource;
        this.performStaticPagination();
      }
    }
  }

  private searchRecords(): void {
    if (this.validate()) {
      this.status.togglePanel(false);

      this.performSearch(0);
      this.searchActivate = true;

    }
  }

  private formatValue(key: string, value: any): string {
    let changedValue = value || EMPTY;

    const searchField = this.searchFields.find(sf => sf.key === key);

    if (searchField) {
      if ((searchField.type === SearchFieldType.DATE) || (searchField.type === SearchFieldType.GMT_DATE)) {
        changedValue = DateUtils.formatDateTime(value, (searchField.dateFormat || DateTimeFormat.MOMENT_YYYY_MM_DD));
      }

      if (searchField.type === SearchFieldType.SEARCH_SELECT) {
        changedValue = this.getSearchFieldControlValue(value, searchField);
      }
    }

    return changedValue;
  }

  private registerOnChangeListeners(): void {
    this.advancedSearchFormSubscriptions.forEach(sub => sub.unsubscribe());

    this.searchFields.map(field => {
      const control = this.advancedSearchForm?.get(field.key);

      if (!!control && ((field.type !== SearchFieldType.DATE) && (field.type !== SearchFieldType.GMT_DATE))) {
        const subscription = control.valueChanges
          .pipe(
            distinctUntilChanged((pre, curr) => isEqual(this.getSearchFieldControlValue(pre, field), this.getSearchFieldControlValue(curr, field))),
            takeUntil(this.destroy$)
          )
          .subscribe(value => this.handleValueChanges(value, field));

        this.advancedSearchFormSubscriptions.push(subscription);
      }
    });
  }

  private getSearchFilters(): { [key: string]: any; } {
    return [
      ...Object.entries(this.advancedSearchForm.controls)
    ].filter(([key, control]) => control.value)
      .reduce(
        (acc, [key, control]) => ({
          ...acc,
          [key]: Array.isArray(control.value)
            ? control.value.join(COMMA)
            : control.value.trim
              ? this.formatValue(key, control.value.trim())
              : this.formatValue(key, control.value)
        }),
        {}
      );
  }

  protected onDateChange(value: string, searchField: SearchField): void {
    if (Utils.isNull(value)) {
      this.advancedSearchForm.get(searchField.key)?.patchValue(null);

      this.performSearch(0);

      return;
    }

    const dateMoment = moment(value, DateTimeFormat.MOMENT_MM_DD_YYYY, true);

    if (dateMoment.isValid() && !isEqual(dateMoment.toDate(), this.advancedSearchForm.controls[searchField.key]?.value)) {
      const value: Date = dateMoment.toDate();
      this.advancedSearchForm.get(searchField.key)?.patchValue(value);

      this.handleValueChanges(value, searchField);
    }
  }

  public getSearchParameter(page: number): any {
    return ({
      ...this.getSearchFilters(),
      page: page,
      size: this.selectedPageSize,
      sort: this.getSortParams()
    });
  }

  protected formatDate(date: Date | string, format: DateTimeFormat, convertToLocal: boolean = false): string {
    return convertToLocal
      ? DateUtils.convertUTCDateTimeToLocalDateTime(date, format)
      : DateUtils.formatDateTime(date, format);
  }

  protected getTimeZone(): string {
    return DateUtils.getTimeZone();
  }

  protected changeMultiSelectPreSelected(selectedValues: any): void {
    this.columns.forEach((column: any) => {
      if (selectedValues.find((selectedValue: any) => selectedValue === column.key)) {
        column.hidden = false;
      } else {
        column.hidden = true;
      }
    });

    this.shownColumns = this.columns
      .filter((column: SearchTableColumn) => !column.hidden || !!column.fixed)
      .map((column: SearchTableColumn) => column.label!);

    this.appStoreService.setSearchTableState(
      this.tableId,
      {
        shownColumns: cloneDeep(this.shownColumns)
      }
    );
  }

  protected onPanelStatusChange(event: boolean): void {
    if (!event) {
      // this.searchFields.map(field => {
      //   if (!field.disableReset) {
      //     this.advancedSearchForm.get(field.key)?.reset();
      //   }
      // });

      if (!isEqual(this.previousSearchFilters, this.advancedSearchForm.getRawValue())) {
        this.advancedSearchForm.patchValue(this.previousSearchFilters);
      }
    }
  }

  protected openPanel(option: number): void {
    this.panelSection = option;

    this.status.togglePanel(false); //make sure panel must be close
    this.status.togglePanel(true);

    this.previousSearchFilters = cloneDeep(this.advancedSearchForm.getRawValue());

    this.searchActivate = false;
  }

  protected isAnyFilterApplied(): boolean {
    return Object.values(this.advancedSearchForm.getRawValue()).some(value => Utils.isNotNull(value));
  }

  protected showClearSearchButton(): boolean {
    return this.searchFields.some(field => Utils.isNotNull(this.advancedSearchForm.get(field.key)?.value) && !field.disableReset);
  }

  protected reset(isClearFiltersRequest: boolean = false): void {
    this.searchActivate = false;
    this.initializeForm = false;

    this.searchFields.map(field => {
      if (!field.disableReset) {
        delete this.previousSearchFilters[field.key];
        this.advancedSearchForm.get(field.key)?.reset(null, { onlySelf: true, emitEvent: false });
      }
    });

    this.searchFilterResetEmitter.emit();

    this.initializeForm = true;

    if (isClearFiltersRequest) {
      this.searchActivate = true; //Fix for multiple APIs call issue on clearing filters(valuechanges)
    }

    if (this.resetSort && Utils.isNotNull(this.sortActive)) {
      this.columns.forEach(col => col.sortDirection = SortDirection.DEFAULT);

      const target = this.columns.find(col => col.key === this.sortActive);

      target && (target.sortDirection = this.sortActiveDirection);
    }

    this.formService.clearFormControlValidators(this.advancedSearchForm);
    this.performSearch(0);
  }

  protected sort(column: SearchTableColumn): void {
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

    this.selection.clear();

    if (this.sorting === SortType.DYNAMIC) {
      this.performSearch(this.page.number);
    } else {
      if(!this.tableData.length){
        this.dataSource = this.sortTableData(this.dataSource, column);
      } else{
        this.tableData = this.sortTableData(this.tableData, column);
        this.performStaticPagination();
      }
    }
  }

  protected isAllSelected(): boolean {
    const totalOfSelected = this.selection.selected.length;
    const totalRows = this.sorting === SortType.DYNAMIC ? this.dataSource.length : this.tableData.length;

    return (totalRows > 0) && (totalOfSelected === totalRows);
  }

  protected masterToggle(event: Event): void {
    const validClick = (event.target as HTMLInputElement).classList.contains(
      'vds-checkbox'
    );

    if (validClick) {
      this.isAllSelected() ?
        this.selection.clear() :
        ((this.sorting === SortType.DYNAMIC) ? this.dataSource : this.tableData).forEach(row => this.selection.select(row));
    }
  }

  protected handleRowSelection(event: any, row: any): void {
    if (event?.checked || (!event.source.checked && event?.value)) {
      if (!this.canSelectMultipleRow) {
        this.selection.clear();
      }

      this.selection.select(row);
    } else {
      this.selection.deselect(row);
    }
  }

  protected handlePagination(event: PageEvent): void {

    this.selectedPageIndex = event.pageIndex;
    this.page.size = event.pageSize;


    if (this.sorting === SortType.DYNAMIC) {
      this.selection.clear();
      this.performSearch(this.selectedPageIndex);
    } else {
      if (this.persistSearchFilters) {
        this.appStoreService.setSearchTableState(this.tableId, {
          pageSize: this.page.size,
          pageNumber: this.selectedPageIndex,
          totalElements: this.tableData.length
        });
      }
      this.performStaticPagination();
    }
  }

  protected setPaginationSize(event: any): void {
    this.selectedPageSize = event.target.value;

    this.performSearch(this.selectedPageIndex);
  }

  protected getStatusDesc(value: StatusCode): string {
    return STATUS_DESC[value];
  }

  protected getStatusIcon(value: StatusCode): VisaIcon {
    return STATUS_ICON[value];
  }

  protected getStatusBadgeType(statusCode: StatusCode): BadgeType {    
    return STATUS_BADGE_TYPE[statusCode];
  }

  protected getStatusDescription(statusCode: StatusCode): StatusDesc {
    return STATUS_DESC[statusCode];
  }

  protected getSortDirectionIcon(sortDirection: SortDirection): VisaIcon {
    return SORT_DIRECTION_ICON[sortDirection];
  }

  protected getSortDirectionDesc(sortDirection: SortDirection): string {
    let currentSortDirection = (sortDirection === SortDirection.DESC)
    ? SortDirection.ASC
    : (sortDirection === SortDirection.ASC)
    ? SortDirection.DESC
    : SortDirection.DEFAULT;
    
    return SORT_DIRECTION_DESC[currentSortDirection];
  }

  protected columnTrackBy(index: number, item: SearchTableColumn): string {
    return EMPTY.concat(index.toString(), item.key);
  }

  protected searchFieldTrackBy(index: number, item: SearchField): string {
    return EMPTY.concat(index.toString(), item.key);
  }

  protected getOptionList(searchField: SearchField): Array<Option> {
    if (searchField.options instanceof Array) {
      return searchField.options;
    }

    return [];
  }

  protected getError(field: SearchField): string {
    return this.formService.getFormControlErrorMessage(this.advancedSearchForm, field.key, field.validationError);
  }

  protected getAvailableDependencyValue(field: SearchField): boolean {
    return !!field.searchDependencies?.some(dep => this.advancedSearchForm.value[dep.parentField]);
  }

  private validate(): boolean {
    this.validationPerformedEmitter.emit();

    const formValidationMap = new Map<AbstractControl, ValidatorFn | Array<ValidatorFn> | null>();


    for (const field of this.searchFields) {
      if (field.validators) {
        formValidationMap.set(this.advancedSearchForm.get(field.key)!, field.validators);
      }
    }

    return this.formService.validate(formValidationMap);
  }


  public performSearch(page: number): void {
    if (!!this.search && this.validate()) {
      const params = this.getSearchParameter(page);

      if (this.persistSearchFilters) {
        this.appStoreService.setSearchTableState(
          this.tableId,
          {
            searchFilters: cloneDeep(this.advancedSearchForm.getRawValue()),
            shownColumns: cloneDeep(this.shownColumns),
            pageNumber: this.selectedPageIndex,
            pageSize: this.selectedPageSize,
            page: cloneDeep(this.page),
            ...this.getSortParams()
          }
        );
      }

      const callback = this.search(params);

      if (!!callback) {
        this.isLoading = true;

        callback.pipe(takeUntil(this.destroy$)).subscribe({
          next: (res: PaginationResponse<any>) => {
            this.isLoading = false;
            this.selection.clear();

            const tableData = res.data;

            if ((res?.statusCode !== HttpStatusCode.Ok) && Utils.isNotNull(res?.errors)) {
              this.alertService.showResponseErrors(res.errors);
              this.dataSource = [];
            } else {
              this.dataSource = tableData;
              if (this.sorting !== SortType.DYNAMIC) {
                this.handleOnDataSourceChange();
              }


              const page: Page = res.page;
              if (page) {
                this.page = page;
              }

              this.previousSearchFilters = cloneDeep(this.advancedSearchForm.getRawValue());
            }
          },
          error: (err: any) => {
            this.isLoading = false;

            console.log(err);
          }
        });
      }
    }
  }

  private mapSortData(searchTableState: SearchTableState): void {
    this.selectedPageIndex = searchTableState?.pageNumber || this.selectedPageIndex;
    this.selectedPageSize = searchTableState?.pageSize || this.selectedPageSize;
    this.sortActive = searchTableState?.sortActive || this.sortActive;
    this.sortActiveDirection = searchTableState?.sortDirection || this.sortActiveDirection;
    this.totalElements = searchTableState?.totalElements || this.totalElements;


    this.page = searchTableState?.page || this.page;

    if (!!this.sortActive) {
      this.columns.forEach(col => {
        if (!!this.sortActive && (col.key === this.sortActive)) {
          col.sortDirection = this.sortActiveDirection;
        } else {
          col.sortDirection = SortDirection.DEFAULT;
        }
      });
    }
  }

  ngAfterViewInit(): void {
    this.caption = Utils.generateCaptionMessage(this.columns, this.tableId);
  }

  ngOnChanges(changes: SimpleChanges): void {
    const searchTableState: SearchTableState = this.appStoreService.getSearchTableState(this.tableId);

    if (changes['searchFields']) {
      this.searchFields.map(field => {
        this.setFieldOptions(field);
        this.prepareDependentFieldMap(field);
      });

      this.initSearchForm();


      if (!isEmpty(searchTableState)) {
        if (!isEmpty(searchTableState.searchFilters)) {
          this.searchActivate = true;

          this.advancedSearchForm.patchValue(searchTableState.searchFilters || {});
        }

      }

      this.registerOnChangeListeners();
      this.handleDependentSearchFields();

    }

    if (changes['columns']) {
      const shownColumns: string[] = searchTableState?.shownColumns!;

      if (Utils.isNotNull(shownColumns)) {
        this.columns.forEach(col => {
          if (!shownColumns.includes(col.label!)) {
            col.hidden = true;
          } else {
            col.hidden = false;
          }
        });
      } else {
        this.shownColumns = this.columns
          .filter((columnIndex: any) => !columnIndex.hidden)
          .map((columnIndex: any) => columnIndex.label);
      }

      this.mapSortData(searchTableState);
    }

    if (changes["sorting"] || changes["dataSource"]) {
      this.mapSortData(searchTableState);

      this.handleOnDataSourceChange();
    }

    if (changes["dataSource"]) {
      this.selection.clear();
    }
  }


  ngOnInit(): void {
    this.selectedPageSize = this.defaultPageSize;

    this.registerOnChangeListeners();

    if (this.initSearch) {
      this.performSearch(this.selectedPageIndex);
    }
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