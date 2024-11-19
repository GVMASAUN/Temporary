import { Component, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { ButtonColor } from '@visa/vds-angular';
import { Observable, map, of } from 'rxjs';
import { EMPTY, SUCCESS_CODE } from 'src/app/core/constants';
import { Module } from 'src/app/core/models/module.model';
import { PaginationResponse } from 'src/app/core/models/pagination-response.model';
import { EnrollmentCollectionService } from 'src/app/services/enrollment-collection/enrollment-collection.service';
import { GarbageCollectorService } from 'src/app/services/garbage-collector.service';
import { NavStatusService } from 'src/app/services/nav-status/nav-status.service';
import { ToggleAlertService } from 'src/app/services/toggle-alert/toggle-alert.service';
import { Utils } from 'src/app/services/utils';
import { SearchTableComponent } from 'src/app/shared/search-table/search-table.component';
import { SearchField, SearchFieldType, SearchTableAction, SearchTableColumn, SearchTableColumnType, SortDirection, SortType } from 'src/app/shared/search-table/search-table.model';
import { EnrollmentCollection, EnrollmentCollectionResponse, EnrollmentCollections, Tenant, TenantType } from '../enrollment-collection.model';
import { StatusCode, STATUS_DESC } from 'src/app/core/models/status.model';

@Component({
    selector: 'app-enrollment-collection-list',
    templateUrl: './enrollment-collection-list.component.html'
})
export class EnrollmentCollectionListComponent implements OnInit, OnDestroy {
    ENROLLMENT_COLLECTION = Module.ENROLLMENT_COLLECTION;
    SortType = SortType;

    showSearchTable: boolean = false;

    tenantList!: Tenant[];

    advancedSearchFields: ReadonlyArray<SearchField> = [];

    tableColumns: ReadonlyArray<SearchTableColumn> = [];

    tableActions: ReadonlyArray<SearchTableAction> = [
        {
            label: 'CREATE COLLECTION',
            buttonColor: ButtonColor.SECONDARY,
            click: () => this.enrollmentCollectionService.navigateToCreatePage()
        }
    ];

    constructor(
        private navStatusService: NavStatusService,
        private alertService: ToggleAlertService,
        private viewContainerRef: ViewContainerRef,
        private enrollmentCollectionService: EnrollmentCollectionService
    ) {
        this.navStatusService.setOverlayStatus(false);
    }

    private getTenantList(): void {
        this.enrollmentCollectionService.getTenantList().subscribe({
            next: (response: PaginationResponse<Array<Tenant>>) => {

                if ((response.statusCode === SUCCESS_CODE) && Utils.isNull(response.errors)) {
                    this.tenantList = response.data;

                    this.setTableColumns();
                    this.setSearchFields();

                    this.showSearchTable = true;
                } else {
                    this.alertService.showResponseErrors(response.errors);
                }
            },
            error: error => {
                this.alertService.showError(error);
                console.log(error);
            }
        });
    }

    private setSearchFields(): void {
        this.advancedSearchFields = [
            // {
            //     key: 'enrolmentCollectionName',
            //     label: 'Enrollment Collection Name'
            // },
            {
                key: 'tenantId',
                label: 'Tenant',
                type: SearchFieldType.SEARCH_SELECT,
                showOnReset: true,
                options: this.enrollmentCollectionService.getEntityOptionList(
                    this.tenantList,
                    TenantType.TENANT,
                    // true
                )
            },

            {
                key: 'subTenantId',
                label: 'Sub-Tenant',
                type: SearchFieldType.SEARCH_SELECT,
                showOnReset: true,
                searchDependencies: [
                    {
                        parentField: 'tenantId',
                        isMandatory: true
                    }
                ],
                searchOptions: (tenantId: string, params) => {
                    const subTenants = this.enrollmentCollectionService.getEntityOptionList(
                        this.tenantList,
                        TenantType.SUBTENANT,
                        // true
                    ).filter(ten => ten?.rawValue?.tenantId === tenantId);

                    return of(subTenants);
                },

            }
        ];
    }

    private setTableColumns(): void {
        this.tableColumns = [
            {
                key: 'enrollmentCollectionName',
                label: 'Enrollment Collection Name',
                type: SearchTableColumnType.LINK,
                fixed: true,
                click: (enrollmentCollection: EnrollmentCollection, component: SearchTableComponent) => {
                    this.enrollmentCollectionService.navigateToEnrollmentCollectionManagePage(enrollmentCollection.enrollmentCollectionId!, enrollmentCollection.tenantEnrollmentId!);
                }
            },
            {
                key: 'tenantName',
                label: 'Entity',
            },
            {
                key: 'tenantEnrollmentId',
                label: 'Entity ID'
            },
            {
                key: 'enrollmentType',
                label: 'Eligible Type',
                mapValue: (enrollmentCollection: EnrollmentCollection, component: SearchTableComponent) => {
                    return 'Account Range'
                }
            },
            {
                key: 'statusCode',
                label: 'Status',
                sortKey: 'statusDesc',
                type: SearchTableColumnType.STATUS
            },
        ];
    }

    private getEntityName(row: EnrollmentCollection): string {
        let entityName: string = EMPTY;

        this.tenantList.forEach((tenant: Tenant) => {
            if (tenant.tenantEnrollmentId === row.tenantEnrollmentId) {
                entityName = tenant.tenantType === TenantType.SUBTENANT ? tenant.subtenantName! : tenant.tenantName!;
            }
        });

        return entityName;
    }

    private init(): void {
        this.getTenantList();
    }

    ngOnInit(): void {
        this.init();
    }

    getEnrollmentCollectionList(filters: any = {}): Observable<PaginationResponse<EnrollmentCollection[]>> {
        let callback;

        if (Utils.isNotNull(filters?.subTenantId) || Utils.isNotNull(filters?.tenantId)) {
            filters = {
                tenantId: filters?.subTenantId || filters.tenantId
            };

            callback = this.enrollmentCollectionService.getEnrollmentCollectionListByTenant(filters);
        } else {
            callback = this.enrollmentCollectionService.getEnrollmentCollectionList();
        }

        return callback.pipe(
            map((enrollmentCollectionResponse: EnrollmentCollectionResponse<EnrollmentCollections>) => {
                if (Utils.isNull(enrollmentCollectionResponse.responseData.enrollmentCollections)) {
                    enrollmentCollectionResponse.responseData.enrollmentCollections = [];
                }

                enrollmentCollectionResponse.responseData.enrollmentCollections.forEach((ec: EnrollmentCollection) => {
                    ec.tenantName = this.getEntityName(ec);
                    ec.statusCode = ec.activeEnrollmentCollection ? StatusCode.ACTIVE : StatusCode.INACTIVE;
                    ec.statusDesc = STATUS_DESC[ec.statusCode];
                });

                const response: PaginationResponse<EnrollmentCollection[]> = {
                    ...enrollmentCollectionResponse,
                    data: enrollmentCollectionResponse.responseData.enrollmentCollections
                };

                return response;
            })
        );
    }

    ngOnDestroy(): void {

        GarbageCollectorService.clearDetachedDOMElements(
            this,
            this.viewContainerRef
        )
    }
}