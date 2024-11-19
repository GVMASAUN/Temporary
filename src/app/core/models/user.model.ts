export interface User {
  _id?: string;
  userId?: string;
  email?: string;
  avatar?: string;

  userDisplayName?: string;
  userRole?: UserRole;
  accessToMultipleClients?: boolean;
  primaryCommunityLevel?: string;
  warningMsg?: string
}

export enum UserRole {
  VISA_GLOBAL_ADMIN = 'VISA_GLOBAL_ADMIN',
  VISA_REGIONAL_ADMIN = 'VISA_REGIONAL_ADMIN',
  VISA_CLIENT_ADMIN = 'VISA_CLIENT_ADMIN',
  CLIENT = 'CLIENT',
  CLIENT_NO_RESTRICTED_FIELDS = 'CLIENT_NO_RESTRICTED_FIELDS',
  CLIENT_REVIEWER = 'CLIENT_REVIEWER',
  CLIENT_READ_ONLY = 'CLIENT_READ_ONLY',
  VISA_REGIONAL_ADMIN_WITH_PAY_WITH_POINTS = 'VISA_REGIONAL_ADMIN_WITH_PAY_WITH_POINTS',
  VISA_CLIENT_ADMIN_WITH_PAY_WITH_POINTS = 'VISA_CLIENT_ADMIN_WITH_PAY_WITH_POINTS'
}
