export default [
  {
    name: 'Resource',
    abstract: true,
    attributes: [
      {
        name: 'partOf',
        dataType: 'ref',
        required: false,
      },
    ],
  },
  {
    name: 'MachineryResource',
    abstract: true,
    attributes: [],
    parentType: 'Resource',
  },
  {
    name: 'InsubstentialResource',
    abstract: true,
    attributes: [],
    parentType: 'Resource',
  },
  {
    name: 'HumanResource',
    abstract: true,
    attributes: [],
    parentType: 'Resource',
  },
  {
    name: 'MaterialResource',
    abstract: true,
    attributes: [
      {
        name: 'location',
        dataType: 'string',
        required: true,
      },
    ],
    parentType: 'Resource',
  },
  {
    name: 'ExhaustibleResource',
    abstract: false,
    parentType: 'MaterialResource',
    attributes: [
      {
        name: 'exhaustionLimit',
        dataType: 'number',
        required: true,
      },
    ],
  },
];
