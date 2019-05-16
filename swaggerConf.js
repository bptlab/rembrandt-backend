module.exports = {
  info: {
    version: '0.1.0',
    title: 'Rembrandt Backend',
    description: 'Backend service for the Rembrandt Resource-Management-Platform.',
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    },
  },
  openapi: '3.0.2',
  apis: [
    'src/models/*.ts',
    'src/routes/*.ts',
  ],
};
