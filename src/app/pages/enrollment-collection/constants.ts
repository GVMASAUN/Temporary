export const tableHeader = [
  {
    label: 'Enrollment Collection Name',
    value: 'name',
    checked: true,
    sortable: true
  },
  { label: 'Assigned?', value: 'assign', checked: true, sortable: true },
  { label: 'Entity', value: 'type', checked: true, sortable: true },
  { label: 'Entity Id', value: 'id', checked: true, sortable: true },
  {
    label: 'Eligible Type',
    value: 'eligibility',
    checked: true,
    sortable: false
  },
  { label: 'Start Date', value: 'sDate', checked: true, sortable: true },
  { label: 'End Date', value: 'eDate', checked: true, sortable: true }
];

export const mockTableList = {
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
      name: 'PwP_Demo',
      assign: false,
      type: 'SOUTHWEST',
      id: '123456',
      eligibility: 'Account Range',
      sDate: '2015-10-07T16:49:16.99',
      eDate: '2015-10-07T16:49:16.99'
    },
    {
      name: '2023_Demo-PwP',
      assign: true,
      type: 'SUBTENANT NAME - 1',
      id: '123456',
      eligibility: 'Account Range',
      sDate: '2015-10-07T16:49:16.99',
      eDate: '2015-10-07T16:49:16.99'
    },
    {
      name: 'PwP_Southwest-collection',
      assign: false,
      type: 'TENANT NAME - 1',
      id: '123456',
      eligibility: 'Account Range',
      sDate: '2015-10-07T16:49:16.99',
      eDate: '2015-10-07T16:49:16.99'
    }
  ]
};
