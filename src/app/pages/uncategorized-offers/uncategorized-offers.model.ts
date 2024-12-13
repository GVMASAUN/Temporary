import { EventGroup } from "../programs/event-group.model"

export enum UncategorizedOfferStep {
    Summary
}

export interface UnsupportedFeatureList {
    nameField: string
    valueField: any
    coordinatesField: any
    locationPropertyField: any[]
    subPropertyField: any[]
    typeField: string
    vopId: string
}

export class UncategorizedOffer extends EventGroup {
    offerId: null | number = null;
    offerName: null | string = null;
    offerType: null | string = null;
    offerDescription: null | string = null;
    offerStartDate: null | string = null;
    offerEndDate: null | string = null;
    enabledIndicator: null | boolean = null;
    metadata: null | string = null;
    extendedOfferId: null | string = null;
    offerTitle: null | string = null;
    offerTerms: null | string = null;
    offerFixedDesc: null | string = null;
    offerExtraTerms: null | string = null;
    offerTempName: null | string = null;
    offerAwardFixed: null | string = null;
    offerAwardPercent: null | string = null;
    offerAwardMax: null | string = null;
    offerMinSpend: null | string = null;
    merchantName: null | string = null;
    offerUrl: null | string = null;
    merchantImageUrlSmall: null | string = null;
    merchantImageUrlMedium: null | string = null;
    merchantImageUrlLarge: null | string = null;
    offerSource: null | string = null;
    offerLanguageCode: null | string = null;
    offerRegion: null | string = null;
    cardLinked: null | boolean = null;

    hasUnsupportedFeatures: boolean = false;
    unsupportedFeatureList: UnsupportedFeatureList[] = [];
}