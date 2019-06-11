import { Serializer } from 'jsonapi-serializer';

export default function serialize(object: any, serializer: Serializer): any {
  const serializedObject = serializer.serialize(object);
  return serializeAttributes(serializedObject);
}

function serializeAttributes(serializedObject: any): any {
  const typesToSerialize = ['parentTypes', 'resourceTypes'];

  if (serializedObject.data) {
    if (Array.isArray(serializedObject.data)) {
      serializedObject.data.forEach((element: any) => {
        if (typesToSerialize.includes(element.type)) {
          const attributes = element.attributes.attributes;
          element.attributes.attributes = serializeAttributesObject(attributes);
        }
      });
    } else {
      if (typesToSerialize.includes(serializedObject.data)) {
        const attributes = serializedObject.data.attributes.attributes;
        serializedObject.data.attributes.attributes = serializeAttributesObject(attributes);
      }
    }
  }
  if (serializedObject.included) {
    serializedObject.included.forEach((element: any) => {
      const attributes = element.attributes.attributes;
      element.attributes.attributes = serializeAttributesObject(attributes);
    });
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
