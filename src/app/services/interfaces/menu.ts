import { IMenuItem } from "./menu.model";

export interface Menu {
  VISA_GLOBAL_ADMIN: IMenuItem[];
  VISA_REGIONAL_ADMIN: IMenuItem[];
  VISA_CLIENT_ADMIN: IMenuItem[];
  CLIENT: IMenuItem[];
  CLIENT_NO_RESTRICTED_FIELDS: IMenuItem[];
  CLIENT_REVIEWER: IMenuItem[];
  CLIENT_READ_ONLY: IMenuItem[];
}
