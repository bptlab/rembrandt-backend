import { prop, Typegoose, Ref, pre, instanceMethod } from 'typegoose';
import ResourceTypeModel, { ResourceType } from '@/models/ResourceType';
import ResourceAttribute from '@/models/ResourceAttribute';
import ResourceAttributeValue from '@/models/ResourceAttributeValue';
import { Serializer } from 'jsonapi-serializer';
import winston from 'winston';

@pre<ResourceInstance>('save', async function() {

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
 *                  resourceType:
 *                    $ref: '#/components/schemas/ResourceType'
 */

export class ResourceInstance extends Typegoose {
  [index: string]: any;
  // region public static methods
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
  keyForAttribute: 'camelCase',
});
