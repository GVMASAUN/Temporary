import { StatusDesc } from "src/app/core/models/status.model";

export enum PayWithPointStep {
    Details = 'Details'
}

export enum PlanType {
    Tenant,
    Sub_Tenant
}

export enum StatementCreditSource {
    Visa = 'VISA',
    Client = 'CLIENT'
}

export enum TenantType {
    Tenant = 'TENANT',
    SubTenant = 'SUBTENANT'
}

export const PlanTypeDesc = {
    [PlanType.Tenant]: 'Tenant',
    [PlanType.Sub_Tenant]: 'Sub-Tenant'
}

export interface Currency {
    currCd: number;
    currNm: string;
    currShrtNm: string;
    currCdAlphaCd: string;
    currDcmlNum: number;
    currRtVal: string;
    currRtNumber: number;
}

export interface Tenant {
    tenantEnrollmentId: string;
    tenantId: string;
    tenantName: string;
    subtenantId: string;
    subtenantName: string;
    accountId: string;
    accountName: string;
    tenantType: string;
    region: string;
}




export interface EnrollmentCollection {
    enrollmentCollectionId: string;
    enrollmentCollectionName: string;
    tenantEnrollmentId: string;
    activeEnrollmentCollection: boolean;
    assignedEndDate: boolean;
    enrollmentType: string;
    tenantId: string;
    subTenantId: string;
    accountRange: AccountRange[];
}

export interface AccountRange {
    rangeStart: string;
    rangeEnd: string;
    rangeId: string;
    actvIndAR: boolean;
}





export interface NotificationTemplate {
    notificationTemplateId: number;
    region: string;
    clientAppId: string;
    notificationTemplateName: string;
    templateType: string;
    templateFrequency: string;
    templateDefinition: TemplateDefinition;
}

export interface TemplateDefinition {
    fileFormatType: string;
    fileNamingType: string;
    fileDeliveryType: string;
    fileHeaderRecord: FileErRecord[];
    fileContentRecord: FileContentRecord[];
    fileTrailerRecord: FileErRecord[];
    requestedEnrichedFields: RequestedEnrichedFields;
}

export interface FileContentRecord {
    templateContentId: string;
    columns: Column[];
}

export interface Column {
    fieldCode: string;
    displayedName: string;
}

export interface FileErRecord {
    dataType: DataType;
    fieldCode: string;
    fieldWidth: number;
    defaultValue: null | string;
    displayedName: string;
}

export interface EndpointTemplate {
    endpointId: string
    tenantEnrollmentId: string
    region: string
    clientAppId: string
    tenantId: string
    subtenantId: string
    accId: any
    endpointName: string
    endpointDescription: string
    notificationChannel: string
    authMethod: string
    outboundFileDefinition: string
    fileGenerationFrequency: number
    authUrl: string
    wsiClientId: string
    callbackUrl: string
    contentType: string
    endpointDirection: any
    endpointCode: any
    secureFolderName: any
    customAttributes: any
}

export interface FulfillmentTemplate {
    tenantEnrollmentId: string
    clientAppId: string
    tenantId: string
    subTenantId: any
    accountId: any
    templateId: string
    templateName: string
    region: string
    notificationEndpointId: string
    notificationEnrollmentLevel: string
    fulfillmentType: string
    templateAttributes: TemplateAttributes
}

export interface TemplateAttributes {
    acquiringBin: string
    acquirerCountryCode: string
    senderReference: string
    senderAccountNumber: any
    senderCountryCode: string
    senderName: string
    senderAddress: string
    senderCity: string
    senderStateCode: string
    transactionCurrencyCode: string
    businessApplicationId: string
    merchantCategoryCode: any
    sourceOfFundsCode: string
    cardAcceptor: CardAcceptor
    settlementServiceIndicator: string
    feeCollectionRequired: boolean
    serviceInvokerId: string
    recipientState: string
    recipientCountryCode: string
    recipientName: string
    recipientFirstName: string
    recipientMiddleInitial: string
    recipientLastName: string
    senderIdentificationNumberBusiness: any
    senderIdentificationNumberIndividual: any
    discountType: any
    discountPromotionCode: any
    maxAmount: string
    senderPostalCode: any
}

export interface CardAcceptor {
    name: string
    terminalId: string
    idCode: string
    address: Address
}

export interface Address {
    city: string
    state: string
    county: string
    country: string
    zipCode: string
}


export interface MerchantCategoryCode {
    mrchCatgCd: number
    mrchCatgNm: string
}

export enum DataType {
    Date = "Date",
    Integer = "Integer",
    String = "String",
}

export interface RequestedEnrichedFields {
    "moe-offer": string[];
}

export class RedemptionRestriction {
    type: string | null = null;
    values: string[] = [];

    constructor(type?: string | null, values?: string[]) {
        this.type = type!;
        this.values = values!;
    }
}

export class TermsAndConditions {
    formattingSyntax: string | null = null;
    version: string | null = null;
    content: string | null = null
}


export class BasePlan {
    planId: string | null = null;
    communityCode: string | null = null;
    communityBID: string | null = null;


    planName: string | null = null;

    startDate: string | null = null;
    endDate: string | null = null;

    //additional
    description?: string | null = null;
    planType?: any;
    startTime?: string | null = null;
    endTime?: string | null = null;
    ///////////////////////////////




    pointTemplateId: string | null = null;
    tenantEnrollmentId: string | null = null;
    enrollmentCollectionId: string | null = null;
    eligibleCardType: string | null = null;




    singularShortName: string | null = null;
    pluralShortName: string | null = null;
    singularLongName: string | null = null;
    pluralLongName: string | null = null;


    issuerCurrency: string | null = null;
    conversionRate: string | null = null;


    endpointDefinitionId: string | null = null;
    notificationTemplateId: string | null = null;
    settlementNotification: boolean = false;
    cancellationNotification: boolean = false;



    fulfillmentTemplateId: string | null = null;
    statementCreditSource: string | null = null;
    settlementDays: number = 0;



    purchaseTotalMin: string | null = null;
    purchaseTotalMax: string | null = null;
    minRewardBalance: string | null = null;
    partialRedemptionAllowance: boolean = false;



    termsAndConditions!: TermsAndConditions;

    redemptionRestrictions: RedemptionRestriction[] = [];

    constructor() {

    }
}


export class Plan extends BasePlan {
    commitId: string | null = null;
    clientAppId: string | null = null;
    tenantId?: string | null = null;
    subtenantId?: string | null = null;
    planStatus: string | null = StatusDesc.DRAFT.toUpperCase();
    startDateEpochsecond: number = 0;
    endDateEpochsecond: number = 0;
    currency: null = null;
    latest: boolean = false;
    createdTimestamp: any;
    modifiedTimestamp: any;
    version: number = 0;
    comment: string | null = null
    modifiedBy: string | null = null;

    constructor() {
        super();
    }
}
