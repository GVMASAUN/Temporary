export class MerchantGroupHistory {
    communityCode: null | string = null;
    communityBid: null | string = null;
    id: null | number = null;
    vopEntityId: null | string = null;
    parentEntityId: null | number = null;
    entityType: null | number = null;
    actionType: null | string = null;
    entityName: null | string = null;
    workflowVersionNumber: null | number = null;
    modifiedUserId: null | string = null;
    modifiedUserFullName: null | string = null;
    modifiedDate: null | string = null;
    moreHistoryMessagesExist: null | boolean = null;

    historyMessages: null | string[] = [];
}

export enum MerchantGroupType {
    VMID_VSID = 'MerchantInfo',
    BIN_CAID = 'AcquirerInfo'
}