import { prop, Typegoose, Ref, pre, instanceMethod } from 'typegoose';
import ResourceTypeModel, { ResourceType } from '@/models/ResourceType';
import ResourceAttribute from '@/models/ResourceAttribute';
import ResourceAttributeValue from '@/models/ResourceAttributeValue';
import { Serializer } from 'jsonapi-serializer';
import winston from 'winston';
import { ObjectId } from 'bson';

@pre<ResourceInstance>('save', async function() {
  if (typeof this.resourceType === 'string') {
    this.resourceType = new ObjectId(this.resourceType);
  }

  const foundType = await ResourceTypeModel.findById( this.resourceType ).exec();

  if (!foundType) {
    const errorText = 'No corresponding ResourceType found!';
    return new Promise((resolve, reject) => {
      reject(new Error(errorText));
    });
  }

  if (foundType.abstract) {
    const errorText = `ResourceType '${foundType.name}' is abstract and can not be instantiated!`;
    return new Promise((resolve, reject) => {
      reject(new Error(errorText));
    });
  }

  const requiredAttributes: ResourceAttribute[] = await foundType.getCompleteListOfAttributes(true);
  for (const requiredAttribute of requiredAttributes) {
    const attribute = this.attributes.find( (instanceAttribute) => {
      return (instanceAttribute.name === requiredAttribute.name);
    });

    if (!attribute || attribute.value === '') {
      const errorText = `Attribute value for ${requiredAttribute.name} must be set.`;
      return new Promise((resolve, reject) => {
        reject(new Error(errorText));
      });
    }
  }
})

/**
 * @swagger
 *
 *  components:
 *    schemas:
 *      ResourceInstance:
 *        allOf:
 *          - $ref: '#/components/schemas/JsonApiObject'
 *          - type: object
 *            properties:
 *              attributes:
 *                type: object
 *                required:
 *                  - attributes
 *                  - resourceType
 *                properties:
 *                  attributes:
 *                    type: array
 *                    items:
 *                      $ref: '#/components/schemas/ResourceAttributeValue'
 *      PopulatedResourceInstance:
 *        allOf:
 *          - $ref: '#/components/schemas/ResourceInstance'
 *          - type: object
 *            properties:
 *              relationships:
 *                $ref: '#/components/schemas/ResourceTypeRelationship'
 *      FlatResourceInstance:
 *        allOf:
 *          - $ref: '#/components/schemas/ResourceInstance'
 *          - type: object
 *            properties:
 *              resourceType:
 *                type: string
 */

export class ResourceInstance extends Typegoose {
  [index: string]: any;
  // region public static methods
  public static convertAttributeArrayToObject(attributeArray: ResourceAttributeValue[]): any {
    const attributeObject: any = {};
    attributeArray.forEach((attributeValue) => {
      attributeObject[attributeValue.name] = attributeValue.value;
    });
    return attributeObject;
  }
  public static convertAttributeObjectToArray(attributeObject: any): ResourceAttributeValue[] {
    const attributeArray: ResourceAttributeValue[] = [];
    Object.keys(attributeObject).forEach((attributeName) => {
      attributeArray.push({
        name: attributeName,
        value: attributeObject[attributeName],
      });
    });
    return attributeArray;
  }
  // endregion

  // region private static methods
  // endregion

  // region public members
  @prop({ required: true })
  public attributes: ResourceAttributeValue[] = [];

  @prop({ required: true, ref: ResourceType })
  public resourceType!: Ref<ResourceType>;
  // endregion

  // region private members
  // endregion

  // region constructor
  // endregion

  // region public methods
  @instanceMethod
  public async setResourceTypeByName(resourceTypeName: string): Promise<void> {
    const foundType = await ResourceTypeModel.findOne({name: resourceTypeName }).exec();
    if (!foundType) {
      const errorText = 'No corresponding ResourceType found!';
      winston.error(errorText);
      return new Promise((resolve, reject) => {
        reject(new Error(errorText));
      });
    }
    this.resourceType = foundType._id;
  }

  @instanceMethod
  public getAttribute(attributeKey: string): string|undefined {
    const foundAttribute = this.attributes.find((attribute) => attribute.name === attributeKey);
    if (foundAttribute) {
      return foundAttribute.value;
    }
    return undefined;
  }

  @instanceMethod
  public setAttribute(attributeKey: string, attributeValue: string): boolean {
    return this.attributes.some((attribute) => {
      if (attribute.name === attributeKey) {
        attribute.value = attributeValue;
        this.markModified('attributes');
        return true;
      }
      return false;
    });
  }
  // endregion

  // region private methods
  // endregion
}

const ResourceInstanceModel = new ResourceInstance().getModelForClass(ResourceInstance);

export default ResourceInstanceModel;

export const resourceInstanceSerializer = new Serializer('resourceInstance', {
  id: '_id',
  attributes: [
    'attributes',
    'resourceType',
  ],
  resourceType: {
    ref: '_id',
    type: 'resourceType',
    attributes: [
      'name',
      'abstract',
      'attributes',
      'parentType',
      'eponymousAttribute',
    ],
  },
  keyForAttribute: 'camelCase',
} as any);
