import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { cloneDeep } from "lodash";
import { Observable, map } from "rxjs";
import { ANY, EMPTY, MERGE, QUESTION_MARK } from "src/app/core/constants";
import { Mode } from "src/app/core/models/mode.model";
import { Module } from "src/app/core/models/module.model";
import { Option } from "src/app/core/models/option.model";
import { PaginationResponse } from "src/app/core/models/pagination-response.model";
import { AccountRange, AccountRanges, AccountRangesResponse, EnrollmentCollection, EnrollmentCollectionResponse, EnrollmentCollections, Tenant, TenantType } from "src/app/pages/enrollment-collection/enrollment-collection.model";
import { SearchTableService } from "src/app/shared/search-table/search-table.service";
import { FunctionsService } from "../util/functions.service";
import { Utils } from "../utils";
import { ApiConfigService } from "../api-config.service";

@Injectable({
    providedIn: 'root'
})
export class EnrollmentCollectionService {
    private readonly URL_CONFIG = {
        base: `${this.env.getUrls().baseUrl}api/v1/pwp/utils/`,
        enrollmentCollection: 'ec',
        enrollmentCollectionList: 'getAllEnrollmentCollectionList',
        enrollmentCollectionListByTenant: 'getEnrollmentCollectionListByTenant',
        getEnrollmentCollectionsById: 'getEnrollmentCollectionsById',
        validateECAccountRange: 'validateECAccountRange',
        saveEnrollmentCollection: 'addEnrollmentCollectionAccountRanges',
        updateEnrollmentCollection: 'updateEnrollmentCollectionAccountRanges',
        listTenants: 'listTenants'
    }

    constructor(
        private router: Router,
        private httpClient: HttpClient,
        private searchTableService: SearchTableService,
        private functionService: FunctionsService,
        private env: ApiConfigService
    ) { }

    private prepareSaveOrUpdateEnrollmentCollectionPayload(enrollmentCollection: EnrollmentCollection): any {
        const payload = {
            enrollmentCollectionId: enrollmentCollection.enrollmentCollectionId,
            entityId: enrollmentCollection.entityId,
            entityType: enrollmentCollection.entityType,
            enrollmentCollectionName: enrollmentCollection.enrollmentCollectionName,
            accountRanges: this.accountRangesPayload(enrollmentCollection.accountRange!)
        }
        return payload;
    }

    private accountRangesPayload(accountRangesList: AccountRange[]): AccountRange[] {
        const newAccountRangeList = cloneDeep(accountRangesList);
        newAccountRangeList.forEach((accountRange: AccountRange) => {
            delete accountRange.uiId
        })

        return newAccountRangeList;
    }

    private parseAccountRangeResponse(accountRangesList: AccountRange[]): void {
        accountRangesList.forEach(
            (accountRange: AccountRange) => {
                accountRange.uiId = Utils.generateNumberId();
            }
        )
    }

    public getEnrollmentCollectionList(): Observable<EnrollmentCollectionResponse<EnrollmentCollections>> {
        return this.httpClient.get<EnrollmentCollectionResponse<EnrollmentCollections>>(
            `${this.URL_CONFIG.base}${this.URL_CONFIG.enrollmentCollection}/${this.URL_CONFIG.enrollmentCollectionList}`
        );
    }

    public getEnrollmentCollectionListByTenant(filters: any = {}): Observable<EnrollmentCollectionResponse<EnrollmentCollections>> {
        return this.httpClient.get<EnrollmentCollectionResponse<EnrollmentCollections>>(
            `${this.URL_CONFIG.base}${this.URL_CONFIG.enrollmentCollection}/${this.URL_CONFIG.enrollmentCollectionListByTenant}${QUESTION_MARK}${this.searchTableService.prepareSearchParams(filters)}`
        );
    }

    public verifyAccountRanges(payload: AccountRanges): Observable<AccountRangesResponse> {
        const finalPayload: AccountRanges = {
            accountRanges: this.accountRangesPayload(payload.accountRanges)
        }

        return this.httpClient.post<AccountRangesResponse>(
            `${this.URL_CONFIG.base}${this.URL_CONFIG.enrollmentCollection}/${this.URL_CONFIG.validateECAccountRange}`,
            finalPayload
        ).pipe(map(response => {
            this.parseAccountRangeResponse(response.accountRanges.accountRanges);

            return response;
        }));
    }

    public saveEnrollmentCollection(enrollmentCollection: EnrollmentCollection): Observable<EnrollmentCollectionResponse<EnrollmentCollection>> {
        const payload = this.prepareSaveOrUpdateEnrollmentCollectionPayload(enrollmentCollection);

        return this.httpClient.post<EnrollmentCollectionResponse<EnrollmentCollection>>(
            `${this.URL_CONFIG.base}${this.URL_CONFIG.enrollmentCollection}/${this.URL_CONFIG.saveEnrollmentCollection}/${enrollmentCollection.entityId}`,
            payload
        );
    }

    public getEnrollmentCollection(id: string, tenantId: string): Observable<EnrollmentCollectionResponse<EnrollmentCollection>> {
        const params = {
            ecId: id,
            tenantId: tenantId
        };

        return this.httpClient.get<EnrollmentCollectionResponse<EnrollmentCollection>>(
            `${this.URL_CONFIG.base}${this.URL_CONFIG.enrollmentCollection}/${this.URL_CONFIG.getEnrollmentCollectionsById}${QUESTION_MARK}${this.functionService.prepareParams(params)}`
        ).pipe(map(response => {
            this.parseAccountRangeResponse(response.responseData.accountRange!);

            return response;
        }));
    }

    public updateEnrollmentCollection(enrollmentCollection: EnrollmentCollection): Observable<EnrollmentCollectionResponse<EnrollmentCollection>> {
        const payload = this.prepareSaveOrUpdateEnrollmentCollectionPayload(enrollmentCollection);

        return this.httpClient.post<EnrollmentCollectionResponse<EnrollmentCollection>>(
            `${this.URL_CONFIG.base}${this.URL_CONFIG.enrollmentCollection}/${this.URL_CONFIG.updateEnrollmentCollection}/${enrollmentCollection.tenantEnrollmentId}`,
            payload
        );
    }

    public getTenantList(): Observable<PaginationResponse<Array<Tenant>>> {
        return this.httpClient.get<PaginationResponse<Array<Tenant>>>(
            `${this.URL_CONFIG.base}${this.URL_CONFIG.listTenants}`
        );
    }

    public returnToEnrollmentCollectionListPage(): void {
        this.router.navigate(
            [Module.ENROLLMENT_COLLECTION.baseUrl],
            {
                queryParamsHandling: MERGE
            }
        );
    }

    public navigateToEnrollmentCollectionManagePage(enrollmentCollectionId: string, tenantEnrollmentId: string): void {
        this.router.navigate([Module.ENROLLMENT_COLLECTION.baseUrl, Mode.Manage, enrollmentCollectionId, tenantEnrollmentId],
            {
                queryParamsHandling: MERGE
            }
        );
    }

    public navigateToCreatePage(backUrl: string = EMPTY) {
        this.router.navigate(
            [Module.ENROLLMENT_COLLECTION.siteMapData![0].pageUrl],
            {
                queryParamsHandling: MERGE,
                state: {
                    backUrl: backUrl
                }
            },
        );
    }

    public getEntityOptionList(tenantList: Tenant[], type: TenantType, addAnyOption: boolean = false): Option[] {
        let entityOptionList: Option[] = [];

        (tenantList || []).forEach((tenant: Tenant) => {
            if ((type === TenantType.TENANT) && (tenant.tenantType === type)) {
                entityOptionList.push(new Option(tenant.tenantId!, tenant.tenantName!, tenant));
            }
            else if ((type === TenantType.SUBTENANT) && (tenant.tenantType === type)) {
                entityOptionList.push(new Option(tenant.subtenantId!, tenant.subtenantName!, tenant));
            } else if ((type === TenantType.ACCOUNT) && (tenant.tenantType === type)) {
                entityOptionList.push(new Option(tenant.accountId!, tenant.accountName!, tenant));
            }
        });

        if (addAnyOption) {
            entityOptionList.unshift(new Option({ value: EMPTY }, ANY, null));
        }

        return entityOptionList;
    }
}