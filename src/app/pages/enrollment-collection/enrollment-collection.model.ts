import { BaseResponse } from "src/app/core/models/pagination-response.model";
import { StatusCode, StatusDesc } from "src/app/core/models/status.model";

export const RANGE_FORMAT_ERROR_MESSAGE: string = 'Invalid Range Format.';
export const RANGE_ORDER_ERROR_MESSAGE: string = 'Minimum account range must be smaller that Maximum account range.';

export enum EnrollmentCollectionStep {
    DETAILS = 'Details'
}

export enum TenantType {
    TENANT = 'TENANT',
    SUBTENANT = 'SUBTENANT',
    ACCOUNT = 'ACCOUNT'
}

export enum EnrollmentType {
    AccountRange = 'AR'
}

export class Tenant {
    tenantEnrollmentId: null | string = null;
    tenantId: null | string = null;
    tenantName: null | string = null;
    subtenantId: null | string = null;
    subtenantName: null | string = null;
    accountId: null | string = null;
    accountName: null | string = null;
    region: null | string = null;

    tenantType: null | TenantType = null;
}

export class EnrollmentCollection {
    enrollmentCollectionId: null | string = null;
    enrollmentCollectionName: null | string = null;
    tenantEnrollmentId: null | string = null;
    tenantId: null | string = null;
    subTenantId: null | string = null;
    communityCode: null | string = null;
    startDate: null | string = null;
    endDate: null | string = null;
    entityType: null | string = null;
    entityId: null | string = null;
    tenantName: null | string = null;
    activeEnrollmentCollection: boolean = false;

    enrollmentType: null | EnrollmentType = null;

    accountRange: null | AccountRange[] = [];

    //only for UI
    statusCode!: StatusCode;
    statusDesc!: StatusDesc;
}

export class AccountRange {
    rangeStart?: null | string = null;
    rangeEnd?: null | string = null;
    rangeId?: null | string = null;
    max?: null | string = null;
    min?: null | string = null;
    accountRangeMax?: null | string = null;
    accountRangeMin?: null | string = null;

    valid?: null | boolean = false;
    actvIndAR?: null | boolean = false;

    // only for ui
    uiId?: null | number = null;

    constructor(
        rangeStart?: null | string,
        rangeEnd?: null | string,
        max?: null | string,
        min?: null | string,
        accountRangeMax?: null | string,
        accountRangeMin?: null | string,
    ) {
        this.rangeStart = rangeStart;
        this.rangeEnd = rangeEnd;
        this.max = max;
        this.min = min;
        this.accountRangeMax = accountRangeMax;
        this.accountRangeMin = accountRangeMin;
    }
}

export class EnrollmentCollectionResponse<T> extends BaseResponse {
    responseData!: T;

    constructor(responseData: T) {
        super();
        this.responseData = responseData;
    }
}

export class EnrollmentCollections {
    enrollmentCollections: EnrollmentCollection[] = [];
}

export class AccountRanges {
    accountRanges!: AccountRange[];
}

export class AccountRangesResponse extends BaseResponse {
    accountRanges!: AccountRanges;

    constructor(accountRanges: AccountRanges) {
        super();
        this.accountRanges = accountRanges;
    }
}