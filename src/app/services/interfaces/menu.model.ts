import { VisaIcon } from "src/app/core/constants";
import { Module } from "src/app/core/models/module.model";
import { UserRole } from "src/app/core/models/user.model";

export interface ISubMenu {
  name: string;
  url: string;
}

export interface IMenuItem {
  icon: VisaIcon;
  rank: number,
  module: Module;
  isSubMenuOpened?: boolean;
  subMenus?: ISubMenu[];
}

export interface IMenu {
  [UserRole.VISA_GLOBAL_ADMIN]: IMenuItem[];
  [UserRole.VISA_REGIONAL_ADMIN]: IMenuItem[];
  [UserRole.VISA_CLIENT_ADMIN]: IMenuItem[];
  [UserRole.CLIENT]: IMenuItem[];
  [UserRole.CLIENT_NO_RESTRICTED_FIELDS]: IMenuItem[];
  [UserRole.CLIENT_REVIEWER]: IMenuItem[];
  [UserRole.CLIENT_READ_ONLY]: IMenuItem[];
  [UserRole.VISA_REGIONAL_ADMIN_WITH_PAY_WITH_POINTS]: IMenuItem[];
  [UserRole.VISA_CLIENT_ADMIN_WITH_PAY_WITH_POINTS]: IMenuItem[];
}
