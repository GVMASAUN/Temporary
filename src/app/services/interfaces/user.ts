export interface User {
  _id?: string;
  email?: string;
  avatar?: string;
  role: string;

  userDisplayName?: string;
  userRole?: string;
  accessToMultipleClients?: boolean;
}

export enum UserRoles {
  administrator = 'administrator'
}
