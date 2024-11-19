
export interface Module {
    name: string;
    uiName: string;
    baseUrl: string;
    siteMapData?: { pageTitle: string, pageUrl: string; }[];
}

export enum ModuleEnum {
    ACTIVITY = 'ACTIVITY',
    CLIENT = 'CLIENT',
    // DASHBOARD = 'DASHBOARD',
    ENROLLMENT_COLLECTION = 'ENROLLMENT_COLLECTION',
    EPM_TEMPLATE = 'EPM_TEMPLATE',
    EVENT_GROUP_TEMPLATE = 'EVENT_GROUP_TEMPLATE',
    FILE_TRANSFER = 'FILE_TRANSFER',
    MERCHANT = 'MERCHANT',
    PAY_WITH_POINT = 'PAY_WITH_POINT',
    PROGRAM = 'PROGRAM',
    REPORT = 'REPORT',
    SUPPORT = 'SUPPORT',
    UNCATEGORIZED_OFFER = 'UNCATEGORIZED_OFFER',
    USER = 'USER'
}

export const Module: { [key in ModuleEnum]: Module } = {
    // [ModuleEnum.DASHBOARD]: {
    //     name: 'Dashboard',
    //     uiName: 'Dashboard',
    //     baseUrl: 'dashboard'
    // },
    [ModuleEnum.CLIENT]: {
        name: 'Client',
        uiName: 'Clients',
        baseUrl: 'clients'
    },
    [ModuleEnum.PROGRAM]: {
        name: 'Program',
        uiName: 'Programs',
        baseUrl: 'program'
    },
    [ModuleEnum.MERCHANT]: {
        name: 'Merchant',
        uiName: 'Merchants',
        baseUrl: 'merchant'
    },
    [ModuleEnum.EPM_TEMPLATE]: {
        name: 'EPM Template',
        uiName: 'EPM Templates',
        baseUrl: 'epm-template',
        siteMapData: [
            {
                pageTitle: 'Create',
                pageUrl: 'epm-template/create'
            }
        ]
    },
    [ModuleEnum.EVENT_GROUP_TEMPLATE]: {
        name: 'Event Group Template',
        uiName: 'Event Group Templates',
        baseUrl: 'event-group-template',
        siteMapData: [
            {
                pageTitle: 'Create',
                pageUrl: 'event-group-template/create'
            }
        ]
    },
    [ModuleEnum.ENROLLMENT_COLLECTION]: {
        name: 'Enrollment Collection',
        uiName: 'Enrollment Collections',
        baseUrl: 'enrollment-collections',
        siteMapData: [
            {
                pageTitle: 'Create',
                pageUrl: 'enrollment-collections/create'
            }
        ]
    },
    [ModuleEnum.USER]: {
        name: 'User',
        uiName: 'Users',
        baseUrl: 'users'
    },
    [ModuleEnum.UNCATEGORIZED_OFFER]: {
        name: 'Uncategorized Offer',
        uiName: 'Uncategorized Offers',
        baseUrl: 'uncategorized-offers'
    },
    [ModuleEnum.PAY_WITH_POINT]: {
        name: 'Pay with Point',
        uiName: 'Pay with Points',
        baseUrl: 'pay-with-points',
        siteMapData: [
            {
                pageTitle: 'Create',
                pageUrl: 'pay-with-points/create'
            }
        ]

    },
    [ModuleEnum.REPORT]: {
        name: 'Reporting',
        uiName: 'Reporting',
        baseUrl: 'report'
    },
    [ModuleEnum.FILE_TRANSFER]: {
        name: 'File Transfer',
        uiName: 'File Transfers',
        baseUrl: 'file-transfer'
    },
    [ModuleEnum.SUPPORT]: {
        name: 'Support',
        uiName: 'Support',
        baseUrl: 'help'
    },
    [ModuleEnum.ACTIVITY]: {
        name: 'Activity',
        uiName: 'Activity',
        baseUrl: 'activity'
    }
};
