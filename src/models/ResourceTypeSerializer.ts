var JSONAPISerializer = require('jsonapi-serializer').Serializer;

export default new JSONAPISerializer('resourceType', {
  id: '_id',
  attributes: [
    'name',
    'abstract',
    'attributes',
    'parentType',
  ],
});
