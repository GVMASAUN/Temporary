import { Module } from "src/app/core/models/module.model";

export const PWP_TRANSACTION_SEARCH_URL = `${Module.PAY_WITH_POINT.baseUrl}/pwp-transaction-search`;
export const PWP_PAN_ELIGIBILITY_URL = `${Module.PAY_WITH_POINT.baseUrl}/pwp-pan-eligibility`;
export const MAX_TRANSACTION_IDS_LIMIT = 25;

//Patterns
export const MULTIPLE_PANS_PATTERN = /^\d{16,19}(,\d{16,19})*$/;
export const PAN_PATTERN = /^\d{16,19}$/;
export const MULTIPLE_TRANSACTION_IDS_PATTERN = /^[0-9a-zA-Z-]{1,36}([, \n]+[0-9a-zA-Z-]{1,36})*$/
export const SPLIT_PATTERN = /\s*,\s*|\s+/;

//Errors
export const INVALID_LOOKBACK_PERIOD = 'Invalid value. Value should be in between 1-36.';
