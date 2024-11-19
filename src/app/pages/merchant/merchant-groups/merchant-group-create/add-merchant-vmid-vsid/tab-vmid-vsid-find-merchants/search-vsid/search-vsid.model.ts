export enum SearchTypeEnum {
    VISA_MERCHANT_NAME = 1,
    MERCHANT_ADDRESS,
    ACQ_BIN_AND_CARD_ACCEPTOR_ID,
    ACQ_BID_AND_ACQ_MID_ID,
    CARD_ACCEPTOR_ID_OR_ACQ_MERCHANT_ID
}

export class VSIDMerchant {
    merchantName = null;
    countryCode = null;
    address = null;
    city = null;
    state = null;
    zipCode = null;
    acquirerBin = null;
    cardAcceptorId = null;
    acquirerBid = null;
    acquirerMid = null;
    merchantSearchType = null;
    communityCode = null;
}
