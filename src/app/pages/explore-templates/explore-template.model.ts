export enum ExploreTemplateStep {
    ENDPOINT_MESSAGES = 'Endpoint Messages',
}

export enum EpmTemplateStep {
    DETAILS = 'Details',
    LINKED_EVENT_GROUPS = 'Linked Event Groups',
    HISTORY = 'History'
}

export enum EpmTemplateField {
    TEMPLATE_COMMUNITY_CODE = 'communityCode',
    TEMPLATE_COMMUNITY_BID = 'communityBID',
    TEMPLATE_MESSAGE_ID = 'messageId',
    TEMPLATE_MESSAGE_NAME = 'messageName',
    TEMPLATE_DEFAULT_MESSAGE_LANGUAGE_CODE = 'defaultMessageLanguageCode',
    TEMPLATE_LANGUAGE_CODE = 'languageCode',
    TEMPLATE_MESSAGE_CHANNEL_CODE = 'messageChannelCode',
    TEMPLATE_SYSTEM_DEFINED_FIELD = 'systemDefinedField',
    TEMPLATE_USER_DEFINED_FIELD = 'userDefinedField',
    TEMPLATE_FORMATTED_LAST_MODIFIED_DATE = 'formattedLastModifiedDate',
    TEMPLATE_FORMATTED_MARKED_FOR_DELETION_DATE = 'formattedMarkedForDeletionDate',
    TEMPLATE_EVENTS_USING_EPM_MESSAGE = 'eventsUsingEPMMessage',
    TEMPLATE_PROCESSED_MESSAGE_COUNT = 'processedMessageCount',
    TEMPLATE_SYSTEM_DEFINED_FIELD_AS_LIST = 'systemDefinedFieldAsList',
    TEMPLATE_USER_DEFINED_FIELD_AS_LIST = 'userDefinedFieldAsList',
}

export enum EpmTemplateAssociationDesc {
    COMMUNITY_GROUP = 'Community Group',
    COMMUNITY_LEVEL = 'Community Level'
}

export class ExploreTemplate {
    communityCode: null | string = null;
    communityBID: null | string = null;
    messageId: null | string = null;
    messageName: null | string = null;
    defaultMessageLanguageCode: null | string = null;
    languageCode: null | string = null;
    messageChannelCode: null | string = null;
    systemDefinedField: null | string = null;
    userDefinedField: null | string = null;
    createdDate: null | string = null;
    modifiedDate: null | string = null;
    markedForDeletionDate: null | string = null;
    formattedLastModifiedDate: null | string = null;
    formattedMarkedForDeletionDate: null | string = null;

}

export class CommunityGroup {
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

export class CustomField {
    customFieldInput : null | string = null;
}

export class MessageField {
    name: null | string = null;
    defaultValue: null | string = null;
    minSize: null | number = null;
    maxSize: null | number = null;
    editable: null | boolean = null;
    displayName: null | string = null;
    normalizedName: null | string = null;
    type: null | string = null;
    fieldtype: null | string = null;
    communityCode: null | string = null;
}

export class EpmTemplate {
    [EpmTemplateField.TEMPLATE_COMMUNITY_CODE]: null | string = null;
    [EpmTemplateField.TEMPLATE_COMMUNITY_BID]?: null | string = null;
    [EpmTemplateField.TEMPLATE_MESSAGE_ID]?: null | string = null;
    [EpmTemplateField.TEMPLATE_MESSAGE_NAME]: null | string = null;
    [EpmTemplateField.TEMPLATE_DEFAULT_MESSAGE_LANGUAGE_CODE]?: null | string = null;
    [EpmTemplateField.TEMPLATE_LANGUAGE_CODE]?: null | string = null;
    [EpmTemplateField.TEMPLATE_MESSAGE_CHANNEL_CODE]?: null | string = null;
    [EpmTemplateField.TEMPLATE_SYSTEM_DEFINED_FIELD]: null | string = null;
    [EpmTemplateField.TEMPLATE_USER_DEFINED_FIELD]?: null | string = null;
    [EpmTemplateField.TEMPLATE_FORMATTED_LAST_MODIFIED_DATE]?: null | string = null;
    [EpmTemplateField.TEMPLATE_FORMATTED_MARKED_FOR_DELETION_DATE]?: null | string = null;
    [EpmTemplateField.TEMPLATE_EVENTS_USING_EPM_MESSAGE]?: any[] = [];
    [EpmTemplateField.TEMPLATE_PROCESSED_MESSAGE_COUNT]?: null | number = null;
    [EpmTemplateField.TEMPLATE_SYSTEM_DEFINED_FIELD_AS_LIST]?: MessageField[] = [];
    [EpmTemplateField.TEMPLATE_USER_DEFINED_FIELD_AS_LIST]?: CustomField[] = [];
}