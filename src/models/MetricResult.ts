import { Serializer } from 'jsonapi-serializer';

//todo metaserialisierer basteln
export const metricResultSerializer = new Serializer('metricResult', {
    id: 'id',
    attributes: [
      'Date',
      'Resource',
      'AllocationService',
      'Duration',
      'Requester',
    ],
    keyForAttribute: 'camelCase',
  } as any);
  