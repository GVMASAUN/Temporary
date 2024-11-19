import { BadgeType } from "@visa/vds-angular";

export enum PWP_TRANSACTION_SEARCH_TYPE {
    PAN = 1, TRANSACTION_ID
}

export enum PanEligibilityStatus {
    Eligible = 'ELIGIBLE', Unenrolled = 'UNENROLLED', NotEligible = 'NOT_ELIGIBLE'
}

export const PAN_ELIGIBILITY_STATUS_DESC = {
    [PanEligibilityStatus.Eligible]: 'Eligible',
    [PanEligibilityStatus.Unenrolled]: 'Unenrolled',
    [PanEligibilityStatus.NotEligible]: 'Not Eligible',

};


export const PAN_ELIGIBILITY_STATUS_BADGE_TYPE = {
    [PanEligibilityStatus.Eligible]: BadgeType.STABLE,
    [PanEligibilityStatus.Unenrolled]: BadgeType.NEUTRAL,
    [PanEligibilityStatus.NotEligible]: BadgeType.CRITICAL

};


export interface PwpPanCardEligibility {
    panIndex: number;
    status: PanEligibilityStatus;
    planId: string;
    errorMessage: string;

    //Only for UI
    pan?: string;
    maskedPan?: string;
}



export interface PwPCSRTxResult {
    pwpTransactionId: string;
    merchantName: string;
    merchantCategoryCode: string;
    transactionAmount: string;
    transactionCurrencyCode: string;
    planId: string;
    transactionTimestamp: string;
    pointsEnquiry: PointsEnquiry;
    pointsRedeem: PointsRedeem[];

    //only for Ui
    isExist?: boolean;
}

export interface PointsEnquiry {
    ineligibleReason: string;
    availablePoints: string;
    partialRedemption: string;
    conversionRate: string;
    transactionPoints: string;
    availalbePointsInAmount: any;
}

export interface PointsRedeem {
    pointsBankApprovalStatus: string;
    transactionMatchStatus: string;
    pointsRedeemed: string;
    last4: string;
    merchantName: string;
    amountRedeemed: string;
    transactionAmount: string;
    merchantCategoryCode: string;
    transactionCurrencyCode: string;
}
