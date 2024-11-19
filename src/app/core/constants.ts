
//commonly used constants
export const EMPTY = '';
export const ANY = 'Any';
export const COMMA = ',';
export const AMPERSAND = '&';
export const SPACE = ' ';
export const QUESTION_MARK = '?';
export const COMMA_SEPARATOR = ', ';
export const COLON_SEPARATOR = ' : ';
export const ELLIPSIS = '...';
export const DAY_START_TIME = "00:00:00";
export const DAY_END_TIME = "23:59:59";
export const ERROR = "Error";
export const SUCCESS = "Success";
export const CONFIRM = "Confirm";
export const CLOSE = 'Close';
export const ERROR_MESSAGE = "Something went wrong.";
export const INVALID_ENTRY = 'Invalid Entry.'
export const VALIDATION_FAIL_ERROR = "Please correct errors on the page before proceeding.";
export const CONFIRM_MESSAGE = "Are you sure?";
export const SUCCESS_CODE = 200;
export const ACTIVE_TAB_STORE_KEY = '_activeTab';
export const IS_OVERLAY_STORE_KEY = '_isOverlay';
export const PREVIOUS_NAV_STATUS_KEY = '_prevNavStatus';
export const MODULE_KEY = '_module';
export const ACTIVE_SUB_TAB_STORE_KEY = '_activeSubTab';
export const ACTIVE_TAB_SUB_MENU_OPENED_KEY = '_activeTabSubMenuOpened';

export const NEWLINE = '\n';
export const ZERO = '0';
export const DEFAULT_PAGE_SIZE = '50';
export const LABEL = 'label';
export const INVALID_DATE = 'Invalid date';
export const REQUIRED_FIELD = 'Required Field';
export const ASSETS_IMAGE_PATH = 'assets/images/';
export const MERGE = 'merge';
export const STRING = 'string';
export const HYPHEN = '-';
export const ASTERISK = '*';
export const RUSULT_NOT_FOUND = 'No results found for current search.';


//patterns
export const NUMBER_PATTERN = /^(-?\d*)$|^(-?\d+)(\.\d*)?$/;
export const COMMA_PATTERN = /\.\s*,/g;
export const DATE_PATTERN_MM_DD_YYYY = /^(0?[1-9]|1[0-2])\/(0?[1-9]|[12]\d|30|31)\/(\d{4})$/

export enum TimeZone {
  GMT = 'GMT'
}

export enum DateTimeFormat {
  MM_DD_YYYY = 'MM/dd/yyyy',
  MOMENT_MM_DD_YYYY = 'MM/DD/YYYY',
  MM_DD_YYYY_HH_MM_A = 'MM/dd/yyyy hh:mm a',
  HH_MM = 'HH:mm',
  HH_MM_SS = 'HH:mm:ss',
  HH_MM_SS_SSS = 'HH:mm:ss.SSS',
  MOMENT_YYYY_MM_DD_TIME = 'YYYY-MM-DD HH:mm:ss:SSS',
  MOMENT_YYYY_MM_DD_T_HH_MM_SS = 'YYYY-MM-DDTHH:mm:ss',
  YYYY_MM_DD_HH_MM_SS = 'YYYY-MM-DD HH:mm:ss',
  YYYY_M_D_HH_MM_SS = 'YYYY-M-D HH:mm:ss',
  YYYY_M_D_H_M_S = 'YYYY-M-D H:m:s',
  YYYY_MM_DD_H_M_S = 'YYYY-MM-DD H:m:s',
  YYYY_MM_DD_HH_MM_SS_Server = 'yyyy-MM-dd HH:mm:ss',
  MOMENT_YYYY_MM_DD = 'yyyy-MM-DD',
  MOMENT_MM_DD_YYYY_HH_MM_A = 'MM/DD/YYYY hh:mm A',
  MM_DD_YYYY_HH_MM_SS_A = 'MM/DD/YYYY hh:mm:ss A',
  YYYY_MM_DD = 'yyyy-MM-dd',
  YYYY_MM_DD__HH_MM_SS = 'yyyy-MM-dd HH:mm:ss'
}

export enum WorkFlowAction {
  SUBMIT_FOR_APPROVAL,
  APPROVE,
  REJECT,
  PUBLISH,
  SUBMIT_FOR_DEACTIVATE,
  DEACTIVATE,
  APPROVE_DEACTIVATION,
  REJECT_DEACTIVATION,
  DELETE,
  DISCARD,
  ARCHIVE
}

export enum VisaIcon {
  ACCOUNT = 'visa_account',
  ADD = 'visa_add',
  ARROW_BACK = 'visa_arrow-back',
  ARROW_COLLAPSE = 'visa_arrow-collapse',
  ARROW_END = 'visa_arrow-end',
  ARROW_EXPAND = 'visa_arrow-expand',
  ARROW_FORWARD = 'visa_arrow-forward',
  ARROW_NEXT = 'visa_arrow-next',
  ARROW_PREVIOUS = 'visa_arrow-previous',
  ARROW_START = 'visa_arrow-start',
  BONUS_POINTS = 'visa_bonus-points',
  CHECKMARK = 'visa_checkmark',
  CLEAR = 'visa_clear',
  CLOSE = 'visa_close',
  CURRENCY_USD = 'visa_currencty-usd',
  DASHBOARD = "visa_dashboard",
  DELETE = 'visa_delete',
  DOCUMENT_ADD = 'document-add',
  DRAG = 'visa_drag',
  EDIT = "visa_edit",
  ERROR = 'visa_error',
  FILE_DOWNLOAD = 'file-download',
  FOLDER = 'visa_folder',
  FOLDER_ACCOUNT = 'folder-account',
  FORK_CODE = 'visa_code-fork-code',
  GLOBAL = 'visa_global',
  HELP = 'visa_help',
  INFO = 'info',
  LOCK = "visa_security_lock",
  MAP_LOCATION_CURRENT = 'visa_map-location-current',
  MERCHANT = 'visa_merchant',
  NOTIFICATION = 'visa_notifications',
  OFFER_DEALS = 'visa_offers-deals',
  OPTIONS = 'options',
  PASSWORD_SHOW = 'password-show',
  POWER = 'visa_power',
  QUESTION = 'visa_question',
  REPORT = 'visa_report',
  SEARCH = 'visa_search',
  SORTABLE = 'visa_sortable',
  SORTABLE_ASCENDING = 'visa_sortable-ascending',
  SORTABLE_DESCENDING = 'visa_sortable-descending',
  SUCCESS = 'visa_success',
  TOPIC = 'visa_topic',
  TRANSACTIONS = "visa_transactions",
  VISA_INFO = 'visa_info',
  WALLET_DEFAULT = 'visa_wallet-default',
  WARNING = 'visa_warning'
}

export enum VisaImage {
  PLUS = 'assets/images/plus.png',
  FLAG = 'assets/images/flag.png',
  ERROR = 'assets/images/error.png',
  BULLETS = 'assets/images/bullets.png',
  PROCESS = 'assets/images/process.png',
  FOLDER = 'assets/images/folder.png',
  FOLDER_2X = 'assets/images/folder-2x.png',
  NEW_WINDOW = 'assets/images/new-window.png',
  CONNECT = 'assets/images/connect.png',
  CONNECT_2X = 'assets/images/connect-2x.png',
  SCHEDULE = 'assets/images/schedule.png',
  SCHEDULE_2X = 'assets/images/schedule-2x.png',
  MAGNIFIER = 'assets/images/magnifier.png',
  RIGHT_ARROW = 'assets/images/single-rightarrow.png',
  RIGHT_ARROW_DOUBLE = 'assets/images/double-rightarrow.png',
  LEFT_ARROW = 'assets/images/single-leftarrow.png',
  LEFT_ARROW_DOUBLE = 'assets/images/double-leftarrow.png',
  QUESTION_MARK = 'assets/images/question-mark.png'
}

