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
];
