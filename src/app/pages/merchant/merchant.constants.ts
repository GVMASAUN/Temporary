export const tableHeader = [
  {
    label: 'Name',
    value: 'name',
    checked: true,
    sortable: true
  },
  {
    label: 'Group Type',
    value: 'merchantGroupType',
    checked: true,
    sortable: true
  },
  {
    label: 'Status',
    value: 'isActive',
    checked: true,
    sortable: true
  },
  {
    label: 'Last Modified Date',
    value: 'modifiedDate',
    checked: true,
    sortable: true
  }
];

export const sampleResponse = {
  statusCode: 200,
  success: true,
  errors: [],
  page: {
    size: 50,
    totalElements: 145,
    totalPages: 3,
    number: 0
  },
  data: [
    {
      id: '854e2d2d-36b6-467f-9c90-ee77a09005b3',
      name: 'APITEST_01',
      communityCode: 'GAPCL',
      merchantGroupType: 'MerchantInfo',
      createdBy: 'MSP',
      createdDate: '2015-10-07T16:49:16.99',
      modifiedBy: 'CYBS',
      modifiedDate: '2022-03-15T07:19:19.44',
      isActive: false
    },
    {
      id: '1c539c6e-102c-4d69-a155-1c5624fc2b33',
      name: 'BC_090922',
      communityCode: 'GAPCL',
      merchantGroupType: 'MerchantInfo',
      createdBy: 'CYBS',
      createdDate: '2022-09-09T18:46:14.64',
      modifiedBy: 'CYBS',
      modifiedDate: '2022-09-09T18:58:01.043',
      isActive: false
    },
    {
      id: '64b17cf7-f8af-4168-9d83-74579f891c7e',
      name: 'BC_1',
      communityCode: 'GAPCL',
      merchantGroupType: 'AcquirerInfo',
      createdBy: 'CYBS',
      createdDate: '2022-09-12T18:47:24.763',
      modifiedBy: 'CYBS',
      modifiedDate: '2023-04-06T19:32:58.397',
      isActive: true
    },
    {
      id: '20c9aed6-cccf-4ffc-8953-20f276e4fd0d',
      name: 'BC_demo_evening',
      communityCode: 'GAPCL',
      merchantGroupType: 'AcquirerInfo',
      createdBy: 'CYBS',
      createdDate: '2023-03-24T01:14:46.29',
      modifiedBy: 'CYBS',
      modifiedDate: '2023-03-24T01:20:31.85',
      isActive: true
    },
    {
      id: 'f101cacd-05de-4ed2-abe6-d8235b71e0f4',
      name: 'BC_demo_evening_2',
      communityCode: 'GAPCL',
      merchantGroupType: 'AcquirerInfo',
      createdBy: 'CYBS',
      createdDate: '2023-03-24T01:27:08.563',
      modifiedBy: 'CYBS',
      modifiedDate: '2023-03-24T01:27:14.433',
      isActive: true
    },
    {
      id: '0c2b30f5-4a74-4ea6-a99b-042ab6ca3951',
      name: 'BC_exclusion_test_1',
      communityCode: 'GAPCL',
      merchantGroupType: 'AcquirerInfo',
      createdBy: 'CYBS',
      createdDate: '2022-09-12T17:23:47.543',
      modifiedBy: 'CYBS',
      modifiedDate: '2022-09-12T17:27:41.203',
      isActive: true
    },
    {
      id: '0aba986d-2b69-4f1c-a2ab-c57be60c62f5',
      name: 'BC_TEST_1',
      communityCode: 'GAPCL',
      merchantGroupType: 'AcquirerInfo',
      createdBy: 'CYBS',
      createdDate: '2022-09-12T20:08:04.733',
      modifiedBy: 'CYBS',
      modifiedDate: '2022-09-12T20:09:18.43',
      isActive: true
    },
    {
      id: '0db38844-ede6-4962-aaa5-83372e705f19',
      name: 'BINCAID_09012022',
      communityCode: 'GAPCL',
      merchantGroupType: 'AcquirerInfo',
      createdBy: 'CYBS',
      createdDate: '2022-09-02T22:56:33.857',
      modifiedBy: 'CYBS',
      modifiedDate: '2023-04-06T21:44:51.297',
      isActive: true
    },
    {
      id: 'ff584514-9447-4b86-a02b-ce710d5ed86d',
      name: 'BINCAID_090922',
      communityCode: 'GAPCL',
      merchantGroupType: 'MerchantInfo',
      createdBy: 'CYBS',
      createdDate: '2022-09-09T18:40:03.943',
      modifiedBy: 'CYBS',
      modifiedDate: '2022-09-09T18:58:56.55',
      isActive: false
    },
    {
      id: 'fc663b50-8044-48fb-a7e2-1fa3cba6141d',
      name: 'BINCAID_090922_willdelete',
      communityCode: 'GAPCL',
      merchantGroupType: 'AcquirerInfo',
      createdBy: 'CYBS',
      createdDate: '2022-09-10T14:45:55.09',
      modifiedBy: 'CYBS',
      modifiedDate: '2022-09-10T14:46:12.057',
      isActive: false
    },
    {
      id: '5915d336-7c3b-4ac4-bea5-64bcdcfd2130',
      name: 'BINCAID_090922a',
      communityCode: 'GAPCL',
      merchantGroupType: 'AcquirerInfo',
      createdBy: 'CYBS',
      createdDate: '2022-09-09T19:56:35.01',
      modifiedBy: 'CYBS',
      modifiedDate: '2022-09-09T19:57:49.983',
      isActive: true
    },
    {
      id: 'dab3f9d8-e276-43bc-a236-aa9f85f68da7',
      name: 'BINCAID_BulkImport',
      communityCode: 'GAPCL',
      merchantGroupType: 'AcquirerInfo',
      createdBy: 'CYBS',
      createdDate: '2022-09-09T19:05:22.347',
      modifiedBy: 'CYBS',
      modifiedDate: '2022-09-09T19:17:47.143',
      isActive: true
    },
    {
      id: '818d45dc-2c4a-4137-b877-88322afa21d8',
      name: 'BINCAID_BulkImport_2',
      communityCode: 'GAPCL',
      merchantGroupType: 'AcquirerInfo',
      createdBy: 'CYBS',
      createdDate: '2022-09-09T19:21:20.21',
      modifiedBy: 'CYBS',
      modifiedDate: '2022-09-09T19:23:10.923',
      isActive: true
    },
    {
      id: '23bade55-e210-489b-a355-ffd8314b53f0',
      name: 'BINCAID_BulkImport_3',
      communityCode: 'GAPCL',
      merchantGroupType: 'AcquirerInfo',
      createdBy: 'CYBS',
      createdDate: '2022-09-12T15:06:05.607',
      modifiedBy: 'CYBS',
      modifiedDate: '2022-09-12T16:11:00.587',
      isActive: true
    },
    {
      id: '097068a5-37c5-48db-a7e2-008ef7378a23',
      name: 'BINCAID_MG_091222',
      communityCode: 'GAPCL',
      merchantGroupType: 'AcquirerInfo',
      createdBy: 'CYBS',
      createdDate: '2022-09-12T16:12:11.423',
      modifiedBy: 'CYBS',
      modifiedDate: '2022-09-12T16:12:11.423',
      isActive: true
    },
    {
      id: 'fe1f01d8-9d04-49c8-9213-12ec3a37953a',
      name: 'bulk_import_test_032423',
      communityCode: 'GAPCL',
      merchantGroupType: 'MerchantInfo',
      createdBy: 'CYBS',
      createdDate: '2023-03-24T15:27:35.29',
      modifiedBy: 'CYBS',
      modifiedDate: '2023-04-06T19:54:37.03',
      isActive: true
    },
    {
      id: 'ade15e58-425f-4718-9763-215331af5466',
      name: 'CAIDNEW',
      communityCode: 'GAPCL',
      merchantGroupType: 'AcquirerInfo',
      createdBy: 'CYBS',
      createdDate: '2017-06-26T20:59:29.99',
      modifiedBy: 'CYBS',
      modifiedDate: '2022-03-15T07:19:19.44',
      isActive: true
    },
    {
      id: '036f51df-b9d3-4f99-825c-b31e901cf489',
      name: 'dataservice',
      communityCode: 'GAPCL',
      merchantGroupType: 'MerchantInfo',
      createdBy: 'CYBS',
      createdDate: '2022-03-08T07:39:29.423',
      modifiedBy: 'CYBS',
      modifiedDate: '2022-03-15T07:19:19.44',
      isActive: false
    },
    {
      id: 'bd8210bc-bf1c-410f-9a06-e3732b2f48e7',
      name: 'dataservice10',
      communityCode: 'GAPCL',
      merchantGroupType: 'AcquirerInfo',
      createdBy: 'CYBS',
      createdDate: '2022-03-15T07:18:45.95',
      modifiedBy: 'CYBS',
      modifiedDate: '2022-05-30T02:49:45.21',
      isActive: true
    },
    {
      id: '55149200-9c8d-4714-a761-c622888270fb',
      name: 'dataservice2',
      communityCode: 'GAPCL',
      merchantGroupType: 'MerchantInfo',
      createdBy: 'CYBS',
      createdDate: '2022-03-08T07:40:46.793',
      modifiedBy: 'CYBS',
      modifiedDate: '2022-03-15T07:19:19.44',
      isActive: true
    },
    {
      id: 'dfde3028-a7e9-45b4-951e-fafb23dea3e9',
      name: 'dataservice3',
      communityCode: 'GAPCL',
      merchantGroupType: 'AcquirerInfo',
      createdBy: 'CYBS',
      createdDate: '2022-03-08T07:40:57.237',
      modifiedBy: 'CYBS',
      modifiedDate: '2022-03-15T07:19:19.44',
      isActive: false
    },
    {
      id: '5921cc96-dbc6-4aa2-ae5a-920ba3ed460c',
      name: 'dataservice4',
      communityCode: 'GAPCL',
      merchantGroupType: 'AcquirerInfo',
      createdBy: 'CYBS',
      createdDate: '2022-03-14T06:09:32.633',
      modifiedBy: 'CYBS',
      modifiedDate: '2022-03-15T07:19:19.44',
      isActive: false
    },
    {
      id: '78ac56cc-95a0-4d15-9014-92b31f94469d',
      name: 'dataservice5',
      communityCode: 'GAPCL',
      merchantGroupType: 'AcquirerInfo',
      createdBy: 'CYBS',
      createdDate: '2022-03-15T07:01:43.647',
      modifiedBy: 'CYBS',
      modifiedDate: '2022-03-15T07:19:19.44',
      isActive: true
    },
    {
      id: '8aacf76e-51b1-45d8-8377-1a49d62dbbfb',
      name: 'dataservice6',
      communityCode: 'GAPCL',
      merchantGroupType: 'MerchantInfo',
      createdBy: 'CYBS',
      createdDate: '2022-03-15T07:06:34.35',
      modifiedBy: 'CYBS',
      modifiedDate: '2022-03-15T07:19:19.44',
      isActive: true
    },
    {
      id: 'e0a6af8f-5241-42a7-a302-78efe8cff5e5',
      name: 'dataservice7',
      communityCode: 'GAPCL',
      merchantGroupType: 'MerchantInfo',
      createdBy: 'CYBS',
      createdDate: '2022-03-15T07:10:01.75',
      modifiedBy: 'CYBS',
      modifiedDate: '2022-03-15T07:19:19.44',
      isActive: true
    },
    {
      id: '6080f030-6e6f-4082-8a4a-f1928975ed24',
      name: 'dataservice8',
      communityCode: 'GAPCL',
      merchantGroupType: 'MerchantInfo',
      createdBy: 'CYBS',
      createdDate: '2022-03-15T07:16:41.647',
      modifiedBy: 'CYBS',
      modifiedDate: '2022-03-15T07:19:19.44',
      isActive: true
    },
    {
      id: 'b760ca84-066f-436f-9a7f-67b25ff19f2f',
      name: 'dataservice9',
      communityCode: 'GAPCL',
      merchantGroupType: 'AcquirerInfo',
      createdBy: 'CYBS',
      createdDate: '2022-03-15T07:17:14.597',
      modifiedBy: 'CYBS',
      modifiedDate: '2022-03-15T07:19:19.44',
      isActive: false
    },
    {
      id: '8e164fab-63da-43ed-99aa-3bc31dda8306',
      name: 'demo april 6',
      communityCode: 'GAPCL',
      merchantGroupType: 'MerchantInfo',
      createdBy: 'CYBS',
      createdDate: '2023-04-06T21:12:53.897',
      modifiedBy: 'CYBS',
      modifiedDate: '2023-04-06T21:12:53.897',
      isActive: true
    },
    {
      id: '97e44224-ccfc-41ce-9eb4-69991ea48f2f',
      name: 'demo april 6',
      communityCode: 'GAPCL',
      merchantGroupType: 'AcquirerInfo',
      createdBy: 'CYBS',
      createdDate: '2023-04-06T21:13:25.493',
      modifiedBy: 'CYBS',
      modifiedDate: '2023-04-06T21:13:25.493',
      isActive: true
    },
    {
      id: 'c8821e9c-ad78-4494-b777-7149ad43dde0',
      name: 'Demo_032323',
      communityCode: 'GAPCL',
      merchantGroupType: 'AcquirerInfo',
      createdBy: 'CYBS',
      createdDate: '2023-03-23T15:43:18.337',
      modifiedBy: 'CYBS',
      modifiedDate: '2023-03-23T15:44:37.217',
      isActive: true
    },
    {
      id: 'af714eeb-d112-455f-b2ef-9354fa3ea69a',
      name: 'demo_9am',
      communityCode: 'GAPCL',
      merchantGroupType: 'MerchantInfo',
      createdBy: 'CYBS',
      createdDate: '2023-03-23T16:22:10.597',
      modifiedBy: 'CYBS',
      modifiedDate: '2023-03-23T16:34:50.927',
      isActive: true
    },
    {
      id: 'a625ff55-b326-45b0-93bb-928b73d618a9',
      name: 'demo_9am_2',
      communityCode: 'GAPCL',
      merchantGroupType: 'MerchantInfo',
      createdBy: 'CYBS',
      createdDate: '2023-03-23T16:40:24.6',
      modifiedBy: 'CYBS',
      modifiedDate: '2023-03-23T16:40:41.237',
      isActive: true
    },
    {
      id: '59e50cc4-1dc7-43cd-8149-220160599a31',
      name: 'demo_9am_3',
      communityCode: 'GAPCL',
      merchantGroupType: 'MerchantInfo',
      createdBy: 'CYBS',
      createdDate: '2023-03-23T17:17:55.207',
      modifiedBy: 'CYBS',
      modifiedDate: '2023-03-23T17:18:15.59',
      isActive: true
    },
    {
      id: 'f57f7d87-77da-4d8f-a196-19777a781feb',
      name: 'DEMOMAR22',
      communityCode: 'GAPCL',
      merchantGroupType: 'MerchantInfo',
      createdBy: 'CYBS',
      createdDate: '2022-03-04T02:27:02.13',
      modifiedBy: 'CYBS',
      modifiedDate: '2022-03-15T07:19:19.44',
      isActive: true
    },
    {
      id: '4e64126f-9aa4-4951-860c-7283015cc356',
      name: 'DEMOMAR23',
      communityCode: 'GAPCL',
      merchantGroupType: 'MerchantInfo',
      createdBy: 'CYBS',
      createdDate: '2022-03-04T02:35:05.11',
      modifiedBy: 'CYBS',
      modifiedDate: '2022-03-15T07:19:19.44',
      isActive: true
    },
    {
      id: 'd72e7e37-1419-4a80-b89c-44816c949182',
      name: 'DEMOMAR24',
      communityCode: 'GAPCL',
      merchantGroupType: 'MerchantInfo',
      createdBy: 'CYBS',
      createdDate: '2022-03-04T02:56:02.39',
      modifiedBy: 'CYBS',
      modifiedDate: '2022-03-15T07:19:19.44',
      isActive: true
    },
    {
      id: '7bc35a74-cb1d-4d9e-b164-9639821dc970',
      name: 'DEMOMAR25',
      communityCode: 'GAPCL',
      merchantGroupType: 'MerchantInfo',
      createdBy: 'CYBS',
      createdDate: '2022-03-04T03:18:02.277',
      modifiedBy: 'CYBS',
      modifiedDate: '2022-03-15T07:19:19.44',
      isActive: true
    },
    {
      id: '9f2ffe49-65a0-4b5b-a04b-19183ceaebd4',
      name: 'DEMOMAR26',
      communityCode: 'GAPCL',
      merchantGroupType: 'MerchantInfo',
      createdBy: 'CYBS',
      createdDate: '2022-03-04T03:53:11.267',
      modifiedBy: 'CYBS',
      modifiedDate: '2022-03-15T07:19:19.44',
      isActive: true
    },
    {
      id: 'bf9ac8d7-d186-4f49-bf61-7575f76192d4',
      name: 'DEMOMAR27',
      communityCode: 'GAPCL',
      merchantGroupType: 'MerchantInfo',
      createdBy: 'CYBS',
      createdDate: '2022-03-04T03:59:21.477',
      modifiedBy: 'CYBS',
      modifiedDate: '2022-03-15T07:19:19.44',
      isActive: true
    },
    {
      id: '2415aca7-23ad-4e30-8d15-e9a09b4f2cff',
      name: 'DEMOMAR28',
      communityCode: 'GAPCL',
      merchantGroupType: 'MerchantInfo',
      createdBy: 'CYBS',
      createdDate: '2022-03-07T07:15:21.213',
      modifiedBy: 'CYBS',
      modifiedDate: '2022-03-15T07:19:19.44',
      isActive: false
    },
    {
      id: '9b24769e-c1fc-402e-a547-7f5fb81af5d5',
      name: 'DEMOMAR31',
      communityCode: 'GAPCL',
      merchantGroupType: 'AcquirerInfo',
      createdBy: 'CYBS',
      createdDate: '2022-03-07T08:20:16.317',
      modifiedBy: 'CYBS',
      modifiedDate: '2022-03-15T07:19:19.44',
      isActive: true
    },
    {
      id: '6e897add-1afd-4be0-9d7a-e36d06a9151e',
      name: 'DEMOMAR32',
      communityCode: 'GAPCL',
      merchantGroupType: 'AcquirerInfo',
      createdBy: 'CYBS',
      createdDate: '2022-03-07T09:25:00.773',
      modifiedBy: 'CYBS',
      modifiedDate: '2022-03-15T07:19:19.44',
      isActive: true
    },
    {
      id: '15ee5c13-6606-4aa7-bbf4-90c91fea623f',
      name: 'DOMINO',
      communityCode: 'GAPCL',
      merchantGroupType: 'MerchantInfo',
      createdBy: 'CYBS',
      createdDate: '2021-09-28T09:24:20.893',
      modifiedBy: 'CYBS',
      modifiedDate: '2022-03-15T07:19:19.44',
      isActive: false
    },
    {
      id: '9bb093cf-0341-4533-b796-fe4d324a0d31',
      name: 'dwa',
      communityCode: 'GAPCL',
      merchantGroupType: 'MerchantInfo',
      createdBy: 'CYBS',
      createdDate: '2023-04-07T11:55:27.09',
      modifiedBy: 'CYBS',
      modifiedDate: '2023-04-07T11:55:27.09',
      isActive: true
    },
    {
      id: 'a9f82995-25ab-4ba0-84dc-568a0cc2d8cd',
      name: 'GAPTest',
      communityCode: 'GAPCL',
      merchantGroupType: 'AcquirerInfo',
      createdBy: 'CYBS',
      createdDate: '2017-05-22T23:27:10.48',
      modifiedBy: 'CYBS',
      modifiedDate: '2022-03-15T07:19:19.44',
      isActive: true
    },
    {
      id: 'f9e1d998-f115-4165-89c5-0ee99210752b',
      name: 'GMMG1',
      communityCode: 'GAPCL',
      merchantGroupType: 'MerchantInfo',
      createdBy: 'CYBS',
      createdDate: '2018-03-07T23:28:51.283',
      modifiedBy: 'CYBS',
      modifiedDate: '2022-03-15T07:19:19.44',
      isActive: true
    },
    {
      id: 'a957480d-6cc7-4cc1-ad3e-544da1d5ea07',
      name: 'GMMG2',
      communityCode: 'GAPCL',
      merchantGroupType: 'AcquirerInfo',
      createdBy: 'CYBS',
      createdDate: '2017-07-22T01:09:19.73',
      modifiedBy: 'CYBS',
      modifiedDate: '2022-03-15T07:19:19.44',
      isActive: true
    },
    {
      id: '861f0cfc-176e-4f0b-9e77-f97d3d1784c9',
      name: 'GONOGOGRP006',
      communityCode: 'GAPCL',
      merchantGroupType: 'AcquirerInfo',
      createdBy: 'cybs',
      createdDate: '2017-03-15T20:48:29.72',
      modifiedBy: 'CYBS',
      modifiedDate: '2022-03-15T07:19:19.44',
      isActive: false
    },
    {
      id: 'e52b1765-31cd-48f5-ae92-3e9a0185495a',
      name: 'Groupon Master MG',
      communityCode: 'GAPCL',
      merchantGroupType: 'MerchantInfo',
      createdBy: 'CYBS',
      createdDate: '2022-07-21T00:50:44.58',
      modifiedBy: 'CYBS',
      modifiedDate: '2023-03-23T15:37:46.867',
      isActive: true
    },
    {
      id: 'c860e3a2-91e0-4428-9ca4-084f4f8e9121',
      name: 'hello april 6',
      communityCode: 'GAPCL',
      merchantGroupType: 'MerchantInfo',
      createdBy: 'CYBS',
      createdDate: '2023-04-06T22:42:01.777',
      modifiedBy: 'CYBS',
      modifiedDate: '2023-04-06T22:42:01.777',
      isActive: true
    }
  ]
};
