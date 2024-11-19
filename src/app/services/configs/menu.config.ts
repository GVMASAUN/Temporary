import { VisaIcon } from 'src/app/core/constants';
import { Module, ModuleEnum } from 'src/app/core/models/module.model';
import { PWP_PAN_ELIGIBILITY_URL, PWP_TRANSACTION_SEARCH_URL } from 'src/app/pages/pay-with-point/pwpConstants';
import { IMenu, IMenuItem } from '../interfaces/menu.model';

export const MenuItems: { [key in ModuleEnum]: IMenuItem } = {
  // [ModuleEnum.DASHBOARD]: {
  //   rank: 1,
  //   icon: VisaIcon.DASHBOARD,
  //   module: Module.DASHBOARD
  // },
  [ModuleEnum.CLIENT]: {
    rank: 2,
    icon: VisaIcon.FOLDER_ACCOUNT,
    module: Module.CLIENT
  },
  [ModuleEnum.PROGRAM]: {
    rank: 3,
    icon: VisaIcon.WALLET_DEFAULT,
    module: Module.PROGRAM
  },
  [ModuleEnum.MERCHANT]: {
    rank: 4,
    icon: VisaIcon.MERCHANT,
    module: Module.MERCHANT
  },
  [ModuleEnum.EPM_TEMPLATE]: {
    rank: 5,
    icon: VisaIcon.GLOBAL,
    module: Module.EPM_TEMPLATE
  },
  [ModuleEnum.EVENT_GROUP_TEMPLATE]: {
    rank: 6,
    icon: VisaIcon.TOPIC,
    module: Module.EVENT_GROUP_TEMPLATE
  },
  [ModuleEnum.ENROLLMENT_COLLECTION]: {
    rank: 7,
    icon: VisaIcon.FORK_CODE,
    module: Module.ENROLLMENT_COLLECTION
  },
  [ModuleEnum.PAY_WITH_POINT]: {
    rank: 8,
    icon: VisaIcon.BONUS_POINTS,
    module: Module.PAY_WITH_POINT,
    subMenus: [
      {
        name: 'Plans',
        url: Module.PAY_WITH_POINT.baseUrl
      },
      {
        name: 'PAN Eligibility',
        url: PWP_PAN_ELIGIBILITY_URL
      },
      {
        name: 'Transaction Search',
        url: PWP_TRANSACTION_SEARCH_URL
      }
    ]
  },
  [ModuleEnum.USER]: {
    rank: 9,
    icon: VisaIcon.ACCOUNT,
    module: Module.USER
  },
  [ModuleEnum.UNCATEGORIZED_OFFER]: {
    rank: 10,
    icon: VisaIcon.FOLDER,
    module: Module.UNCATEGORIZED_OFFER
  },
  [ModuleEnum.SUPPORT]: {
    rank: 11,
    icon: VisaIcon.HELP,
    module: Module.SUPPORT
  },
  [ModuleEnum.REPORT]: {
    rank: 12,
    icon: VisaIcon.REPORT,
    module: Module.REPORT
  },
  [ModuleEnum.FILE_TRANSFER]: {
    rank: 13,
    icon: VisaIcon.TRANSACTIONS,
    module: Module.FILE_TRANSFER
  },
  [ModuleEnum.ACTIVITY]: {
    rank: 14,
    icon: VisaIcon.NOTIFICATION,
    module: Module.ACTIVITY
  }
};


const commonModules: IMenuItem[] = [
  // MenuItems.DASHBOARD,
  MenuItems.CLIENT,
  MenuItems.PROGRAM,
  MenuItems.SUPPORT
];

export const menuConfig: IMenu = {
  VISA_GLOBAL_ADMIN: [
    ...commonModules,
    MenuItems.MERCHANT,
    MenuItems.EPM_TEMPLATE,
    MenuItems.EVENT_GROUP_TEMPLATE,
    MenuItems.ENROLLMENT_COLLECTION,
    MenuItems.PAY_WITH_POINT,
    MenuItems.USER,
    MenuItems.UNCATEGORIZED_OFFER
  ],
  VISA_REGIONAL_ADMIN: [
    ...commonModules,
    MenuItems.MERCHANT,
    MenuItems.EPM_TEMPLATE,
    MenuItems.EVENT_GROUP_TEMPLATE,
    MenuItems.UNCATEGORIZED_OFFER
  ],
  VISA_CLIENT_ADMIN: [
    ...commonModules,
    MenuItems.MERCHANT,
    MenuItems.EPM_TEMPLATE,
    MenuItems.EVENT_GROUP_TEMPLATE,
    MenuItems.UNCATEGORIZED_OFFER
  ],
  CLIENT: [
    ...commonModules,
    MenuItems.MERCHANT,
    MenuItems.UNCATEGORIZED_OFFER
  ],
  CLIENT_NO_RESTRICTED_FIELDS: [
    MenuItems.MERCHANT,
    MenuItems.UNCATEGORIZED_OFFER
  ],
  CLIENT_REVIEWER: [
    ...commonModules,
    MenuItems.MERCHANT,
    MenuItems.UNCATEGORIZED_OFFER
  ],
  CLIENT_READ_ONLY: [
    ...commonModules
  ],
  VISA_REGIONAL_ADMIN_WITH_PAY_WITH_POINTS: [
    ...commonModules,
    MenuItems.MERCHANT,
    MenuItems.EPM_TEMPLATE,
    MenuItems.EVENT_GROUP_TEMPLATE,
    MenuItems.UNCATEGORIZED_OFFER,
    MenuItems.ENROLLMENT_COLLECTION,
    MenuItems.PAY_WITH_POINT
  ],
  VISA_CLIENT_ADMIN_WITH_PAY_WITH_POINTS: [
    ...commonModules,
    MenuItems.MERCHANT,
    MenuItems.EPM_TEMPLATE,
    MenuItems.EVENT_GROUP_TEMPLATE,
    MenuItems.UNCATEGORIZED_OFFER,
    MenuItems.ENROLLMENT_COLLECTION,
    MenuItems.PAY_WITH_POINT
  ]
};
