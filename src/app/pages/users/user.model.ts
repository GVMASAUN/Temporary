export const PRIMARY_BID_ERROR = 'Bid already associated with Primary Bid.'

export enum UserStep {
    DETAILS = 'Details',
    HISTORY = 'History'
}

export enum Action {
    ADD_BID = 'addBid',
    REMOVE_BID = 'removeBid'
}

export class User {
    userId: null | number = null;
    firstName: null | string = null;
    lastName: null | string = null;
    volId: null | string = null;
    email: null | string = null;
    isActive: null | boolean = null;
    authorizedBids: Bid[] = [];
    roles: UserRole[] = [];
    authorizedRegions: Region[] = [];
    primaryBid: null | Bid = null;
    primaryRole: null | UserRole = null;
}

export class UserRole {
    roleId: null | number = null;
    role: null | string = null;
}

export class UserHistory {
    communityCode: null | string = null;
    communityBid: null | string = null;
    id: null | number = null;
    entityId: null | number = null;
    parentEntityId: null | number = null;
    entityType: null | number = null;
    actionType: null | string = null;
    entityName: null | string = null;
    workflowVersionNumber: null | number = null;
    modifiedUserId: null | string = null;
    modifiedUserFullName: null | string = null;
    modifiedDate: null | string = null;
    historyMessages: null | string[] = [];
}

export class Region {
    regionId: null | string = null;
    regionName: null | string = null;
}

export class Bid {
    bidId: null | number = null;
    bid: null | string = null;
    regionCode: null | Region = null;
    countryCode: null | number = null;
    businessCategory: null | string = null;
    isActive: null | boolean = null;
    communityLevels: CommunityLevel[] = [];
}

export class CommunityLevel {
    communityCode: null | string = null;
    communityName: null | string = null;
    communityBID: null | string = null;
    communityDescription: null | string = null;
    communityCity: null | string = null;
    communityState: null | string = null;
    communityCountryCode: null | string = null;
    communityPostalCode: null | string = null;
    communityRegionCode: null | string = null;
    communitySenderAddress1: null | string = null;
    communityCardAcceptorAddressCounty: null | string = null;
    internalBin: null | string = null;
    isActive: null | boolean = null;
    isTemplate: null | boolean = null;
    levelType: null | string = null;
    merchantSourceBin: null | string = null;
    parentCommunityCode: null | string = null;
    primaryShortCode: null | string = null;
    rateLimiting: null | string = null;
    secondaryShortCode: null | string = null;
    serviceEndDate: null | string = null;
    serviceStartDate: null | string = null;
    userKey: null | string = null;
    refreshedTimestamp: null | string = null;
    supportedCategoryGroups: any[] = [];
}