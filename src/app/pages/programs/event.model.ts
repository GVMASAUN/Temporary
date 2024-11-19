import { EMPTY } from "src/app/core/constants";
import { Option } from "src/app/core/models/option.model";
import { StatusCode } from "src/app/core/models/status.model";

export enum StatementCreditStatus {
    Success = 'Success',
    Failure = 'Failure'
}

export enum EventType {
    Authorized = 1,
    Cleared,
    Enrolled,
    Card_Added,
    Scheduled,
    Card_Removed,
    Profile_Changed,
    Unenrolled,
    Activated,
    Statement_Credit_Response = 11,
    On_Return,
}

export const EVENT_TYPE_DESC = {
    [EventType.Authorized]: 'Authorized',
    [EventType.Cleared]: 'Cleared',
    [EventType.Enrolled]: 'Enrolled',
    [EventType.Card_Added]: 'Card Added',
    [EventType.Scheduled]: 'Scheduled',
    [EventType.Card_Removed]: 'Card Removed',
    [EventType.Profile_Changed]: 'Profile Changed',
    [EventType.Unenrolled]: 'Unenrolled',
    [EventType.Activated]: 'Activated',
    [EventType.Statement_Credit_Response]: 'Statement Credit Response',
    [EventType.On_Return]: 'On Return',
};

export enum AttributeCategory {
    EVENT = 'Event',
    TARGETING = 'Targeting'
}

export enum EventSelection {
    Event_Conditions = "Event Conditions",
    Event_Actions = "Event Actions",
    Segmentation_Criteria = "Segmentation Criteria"
}



export enum EventStep {
    EVENT_DETAILS = 'Event Details',
    EVENT_CONDITIONS = 'Event Conditions',
    EVENT_RELATIONSHIPS = 'Event Relationships',
    EVENT_ACTION = 'Event Actions'
}

export const ALLOWED_EVENT_TYPE_ID_GROUP_ATTRIBUTES: any = {
    [EventType.Authorized]: ['Merchant', 'Merchant Geography', 'Transaction'],
    [EventType.On_Return]: ['Merchant', 'Merchant Geography', 'Transaction']
}

export const CLEARING_ATTRIBUTES_MAPPING: any = {
    CMLS: ['Installment Sequence Number', 'Terminal ID']
}


export enum SpecialAttribute {
    BETWEEN_GMT_TIME = 'Between GMT Time',
    DATE_ENROLLED = 'Date Enrolled',
    Previously_Completed_Events = 'Previously Completed Events',
    MERCHANT_GROUP_NAME = 'Merchant Group Name',
    USER_AGGREGATE_PERIOD_DAYS = 'User Aggregate Period (Days)',
    PURCHASE_DATE = 'PurchaseDate'
}

export enum EventAttributeType {
    TIME = 'time',
    DATE = 'date',
    CUSTOM = 'custom',
    DECIMAL = 'decimal',
    NUMERIC = 'numeric',
    DB = 'db'
}

export enum EventAttributeOperatorType {
    GREATER_THAN = 'GT',
    GREATER_THAN_EQUAL = 'GTE',
    LESS_THAN = 'LT',
    LESS_THAN_EQUAL = 'LTE',
    EQUAL_TO = 'EQ',
    BETWEEN = 'BETWEEN',
    IS_IN_LIST = 'IN',
    IS_NOT_IN_LIST = 'NOTIN'
}

export enum EventActionType {
    Endpoint = 'Endpoint',
    EndpointAggregate = 'Endpoint (Aggregate)',
    StatementCredit = 'Statement Credit'
}

export enum EventActionFulfillmentMonetaryType {
    Pct = 'pct',
    Fixed = 'fixed'
}



export enum EventConditionAction {
    ADD,
    EDIT,
    DELETE
}

export enum RecurrenceLimit {
    Once = 1,
    NoLimit = -1,
    UpTo = 2
}

export const RECURRENCE_LIMIT_DESC = {
    [RecurrenceLimit.Once]: 'Once',
    [RecurrenceLimit.NoLimit]: 'No Limit',
    [RecurrenceLimit.UpTo]: 'Up To'
};

export const EVENT_ACTION_FULFILLMENT_MONETARY_TYPE_DESC = {
    [EventActionFulfillmentMonetaryType.Pct]: 'Percentage of Transaction',
    [EventActionFulfillmentMonetaryType.Fixed]: 'Fixed Amount'
};

export const EVENT_SECTION_ATTRIBUTE_CATEGORY = {
    [EventSelection.Event_Conditions]: AttributeCategory.EVENT,
    [EventSelection.Segmentation_Criteria]: AttributeCategory.TARGETING,
    [EventSelection.Event_Actions]: EMPTY
}

interface notificationDelayValues {
    days: number;
    hours: number;
    minutes: number;
}

export interface EventConditionSection {
    id: number;
    referenceId: number;
    referenceType: string;
    uiSectionName: EventSelection;
    hasMaxEvent: boolean;
    activeIndicator: boolean;
    modifiedDate: any;

    // for ui only
    attributeCategory: AttributeCategory
}


export class CustomFieldValueList {
    key: string | null = null;
    value: string | null = null;
}


export class MerchantCategory {
    id!: number;
    label!: string;
    category!: string;
    subCategory!: string;
    referenceData!: boolean;
}

export class EventAttribute {
    attributeId: number | null = null;
    attributeCategory: string | null = null;
    attributeSubCategory!: string;
    attributeName: string | null = null;
    attributeDisplayName: string | null = null;
    attributeOperators: string | null = null;
    attributeType: EventAttributeType | null = null;
    isApiAttributeType: boolean = false;
    rtmKey: string | null = null;
    requiredAttributeIds: string | null = null;
    activeIndicator: boolean = false;
    modifiedDate: string | null = null;
    compoundField: boolean = false;
    associatedAttribute: any | null = null;
    multiSelect: boolean = false;
    singleSelect: boolean = false;
    multipleRequireIDsORs: boolean = false;
    apiPath: string | null = null;

    operators: EventAttributeOperator[] = [];
}

export class EventAttributeOperator {
    key: EventAttributeOperatorType | null = null;
    value: string | null = null;
}


export class CriteriaValues {
    criteriaValues: any[] = [];
    singleCriteriaValue1: string | null = null;
    singleCriteriaValue2: string | null = null;

    // for UI
    singleSelectComparisonValueId?: string | null = null;
    singleSelectComparisonValueLabel?: string | null = null;
}

// this class used for event details(conditions)
export class EventCondition {
    communityCode: string | null = null;
    communityBID: string | null = null;
    id: number | null = null;
    eventDetailTemplateId: number | null = null;
    eventDetailId: number | null = null;
    eventId: number | null = null;
    eventStageId: number | null = null;
    eventAttributeId: number | null = null;
    eventRuleOperator: string | null = null;
    createdDate: string | null = null;
    attributeCategory: AttributeCategory | null = null;
    attributeDisplayName: string | null = null;
    attributeType: EventAttributeType | null = null;
    requiredAttributeIds: string | null = null;
    compoundField: boolean = false;

    criteriaValues: CriteriaValues | null = null;

    eventRuleOperatorLocked: boolean = false;
    eventRulePropertyValLocked: boolean = false

    // for UI only
    uId?: string | null = null;
    selectedAttribute?: EventAttribute | null = null;
    disabledAttribute?: boolean = false;
    isAssociatedEventCondition?: boolean = true;

    attributeGroups?: any[] = []
    attributeOperators?: EventAttributeOperator[] = [];
    attributeComparisonValues?: Option[] = [];
    dependentEventConditions?: EventCondition[] = [];

    constructor(uId: string | null = null, isAssociatedEventCondition: boolean = false) {
        this.uId = uId;
        this.isAssociatedEventCondition = isAssociatedEventCondition;
    }
}




export class Event {
    communityCode: null | string = null;
    communityBID: null | string = null;
    eventStageId: null | number = null;
    eventId: null | number = null;
    eventTemplateId: null | number = null;
    eventGroupId = null;
    eventDescription: null | string = null;
    eventName = null;
    eventTypeId: EventType | null = null;
    eventType: null | string = null;
    eventStartDate: null | any = null;
    eventEndDate: null | any = null;
    eventStatus: StatusCode = StatusCode.DRAFT;
    recurrenceLimit: RecurrenceLimit | null = null;
    recurrenceLimitLocked: boolean = false;
    isReusable = null;
    uiStructurePos: number | null = null;
    createdDate: null | string = null;
    modifiedDate: null | string = null;
    versionNumber: null | number = null;
    startDate: null | any = null;
    endDate: null | any = null;
    statusName: null | string = null;
    statementCreditEventId?: null | number = null;
    statementCreditStatus?: null | string = null;

    eventDetails: EventCondition[] = [];
    eventActions: EventAction[] = [];

    // fro UI only
    formattedStartDate?: null | any = null;
    formattedEndDate?: null | any = null;
    startTime?: any = null;
    endTime?: any = null;
    occurrence?: number | null = null;
    eventConditionSections?: EventConditionSection[] = [];

    constructor() { }
}


export class EventAction {
    'actionName': null | string = null;
    'communityCode': null | string = null;
    'communityBID': null | any = null;
    eventActionTemplateId: null | number = null;
    'id': null | number = null;
    'eventId': null | any = null;
    'eventStageId': null | number = null;
    'eventActionTypeId': null | number = null;
    'eventActionType': null | string = null;
    'endpointMessageId': null | string = null;
    'endpointMessageName': null | string = null;
    'endpointUrlName': null | string = null;
    'notifyMessageFirst': null | 'Y' | 'N' = null;
    'notifyMessageEvery': null | any = null;
    'notifyMessageMax': null | any = null;
    'fulfillmentMonetaryType': null | EventActionFulfillmentMonetaryType = null;
    'fulfillmentMonetaryValue': null | any = null;
    'fulfillmentCurrency': null | any = null;
    'fulfillmentConstraint': null | any = null;
    'fulfillmentConstraintCurrency': null | any = null;
    'merchantCity': null | any = null;
    'merchantDescriptor': null | any = null;
    'amountType': null | any = null;
    'activeIndicator': null | any = true;
    'uiStructurePos': null | number = null;
    'versionNumber': null | number = null;
    'eventActionName': null | string = null;
    'formattedLastModifiedDate': null | string = null;
    'notificationDelayValue': null | notificationDelayValues = null;
    'epmSystemDefinedFields': null | string = null;
    'customFieldValueList': null | CustomFieldValueList[] = null;
    endpointMessageNameLocked: boolean = false;
    customFieldValuesLocked: boolean = false;
    statementCreditType: boolean = false;
}

export class EventMessage {
    communityCode: string | null = null;
    communityBID: string | null = null;
    id: number | null = null;
    entityId: number | null = null;
    parentEntityId: number | null = null;
    entityType: number | null = null;
    comment: string | null = null;
    workflowVersionNumber: number | null = null;
    commentCreatedDate: string | null = null;
    createdUserId: string | null = null;
    createdUserFullName: string | null = null;
    createdDate: string | null = null;
}

