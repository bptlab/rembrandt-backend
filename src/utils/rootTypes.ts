export default [
  {
    name: 'Resource',
    abstract: true,
    attributes: [],
  },
  {
    name: 'Machinery Resource',
    abstract: true,
    attributes: [],
    parentType: 'Resource',
  },
  {
    name: 'Insubstantial Resource',
    abstract: true,
    attributes: [],
    parentType: 'Resource',
  },
  {
    name: 'Human Resource',
    abstract: false,
    attributes: [
      {
        name: 'name',
        dataType: 'string',
        required: false,
      },
    ],
    parentType: 'Resource',
    eponymousAttribute: 'name',
  },
  {
    name: 'Material Resource',
    abstract: true,
    attributes: [
      {
        name: 'location',
        dataType: 'string',
        required: false,
      },
    ],
    parentType: 'Resource',
  },
  {
    name: 'Exhaustible Resource',
    abstract: false,
    parentType: 'Material Resource',
    attributes: [
      {
        name: 'exhaustion limit',
        dataType: 'number',
        required: true,
      },
    ],
  },
];
