import { Serializer } from 'jsonapi-serializer';

const typesToSerialize = ['parentTypes', 'resourceTypes'];

export default function serialize(object: any, serializer: Serializer): any {
  const serializedObject = serializer.serialize(object);
  if (serializedObject.data) {
    serializedObject.data = serializeAttributesOfResourceTypes(serializedObject.data);
  }
  if (serializedObject.included) {
    serializedObject.included = serializeAttributesOfResourceTypes(serializedObject.included);
  }
  return serializedObject;
}

function serializeAttributesOfResourceTypes(serializedObject: any[] | any): any {
  if (Array.isArray(serializedObject)) {
    return serializedObject.map((element: any) => {
      return serializeAttributesOfResourceType(element);
    });
  } else {
    return serializeAttributesOfResourceType(serializedObject);
  }
}

function serializeAttributesOfResourceType(serializedObject: any) {
  if (typesToSerialize.includes(serializedObject.type)) {
    const attributes = serializedObject.attributes.attributes;
    serializedObject.attributes.attributes = serializeAttributesObject(attributes);
  }
  return serializedObject;
}

function serializeAttributesObject(attributeObject: any) {
  const serializedAttributes = attributeObject.map((attribute: any) => {
    attribute = attribute.toJSON();
    attribute.id = attribute._id;
    delete attribute._id;
    return attribute;
  });
  return serializedAttributes;
}
