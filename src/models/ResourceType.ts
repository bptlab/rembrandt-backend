import { Typegoose, prop, arrayProp, Ref, pre, instanceMethod } from 'typegoose';
import ResourceInstanceModel from '@/models/ResourceInstance';
import ResourceAttribute from '@/models/ResourceAttribute';
import { Serializer } from 'jsonapi-serializer';

@pre<ResourceType>('save', async function(): Promise<void> {
  if (!this.parentType && this.name !== 'Resource') {
    return new Promise((resolve, reject) => {
      reject(new Error(`Parent resource type for new type '${this.name}' must be defined.`));
    });
  }

  if (this.eponymousAttribute) {
    const allAttributes = await this.getCompleteListOfAttributes();
    const eponymousAttributeDefined = allAttributes.some((attribute) => {
      return attribute.name === this.eponymousAttribute;
    });
    if (!eponymousAttributeDefined) {
      return new Promise((resolve, reject) => {
        reject(new Error(`The attribute marked as eponymous '${this.eponymousAttribute}' is not defined on this resource type.`));
      });
    }
  }

  if (this.costAttribute) {
    const allAttributes = await this.getCompleteListOfAttributes();
    const costAttributeDefined = allAttributes.some((attribute) => {
      return attribute.name === this.costAttribute;
    });
    if (!costAttributeDefined) {
      return new Promise((resolve, reject) => {
        reject(new Error(`The attribute marked as costAttribute '${this.costAttribute}' is not defined on this resource type.`));
      });
    }
  }
})

@pre<ResourceType>('remove', async function(): Promise<void> {
  const childTypesCount = await ResourceTypeModel.countDocuments({ parentType: this._id }).exec();
  if (childTypesCount > 0) {
    return new Promise((resolve, reject) => {
      reject(new Error(`There are ${childTypesCount} resource types with '${this.name}' as parent. ` +
        `Type can not be deleted.`));
    });
  }

  const instancesCount = await ResourceInstanceModel.countDocuments({ resourceType: this._id }).exec();
  if (instancesCount > 0) {
    return new Promise((resolve, reject) => {
      reject(new Error(`There are ${instancesCount} instances of type '${this.name}'. Type can not be deleted.`));
    });
  }
})

/**
 * @swagger
 *
 *  components:
 *    schemas:
 *      ResourceType:
 *        allOf:
 *          - $ref: '#/components/schemas/JsonApiObject'
 *          - type: object
 *            properties:
 *              attributes:
 *                type: object
 *                required:
 *                  - name
 *                  - abstract
 *                  - attributes
 *                properties:
 *                  name:
 *                    type: string
 *                  abstract:
 *                    type: boolean
 *                  attributes:
 *                    type: array
 *                    items:
 *                      $ref: '#/components/schemas/ResourceAttribute'
 *                  eponymousAttribute:
 *                    type: string
 *      PopulatedResourceType:
 *        allOf:
 *          - $ref: '#/components/schemas/ResourceType'
 *          - type: object
 *            properties:
 *              relationships:
 *                $ref: '#/components/schemas/ParentTypeRelationship'
 *      FlatResourceType:
 *        allOf:
 *          - $ref: '#/components/schemas/ResourceType'
 *          - type: object
 *            properties:
 *              attributes:
 *                type: object
 *                properties:
 *                  parentType:
 *                    type: string
 */

export class ResourceType extends Typegoose {
  [index: string]: any;
  // region public static methods
  // endregion

  // region private static methods
  // endregion

  // region public members
  @prop({ required: true, unique: true })
  public name: string = '';

  @prop({ required: true })
  public abstract: boolean = false;

  @arrayProp({ required: true, items: ResourceAttribute })
  public attributes: ResourceAttribute[] = [];

  @prop({ required: false })
  public eponymousAttribute?: string;

  @prop({ required: false })
  public costAttribute?: string;

  @prop({ ref: ResourceType })
  public parentType?: Ref<ResourceType>;
  // endregion

  // region private members
  // endregion

  // region constructor
  // endregion

  // region public methods
  @instanceMethod
  public async getCompleteListOfAttributes(requiredOnly: boolean = false): Promise<ResourceAttribute[]> {
    let attributes: ResourceAttribute[] = this.attributes;
    let parentTypeId = this.parentType;

    while (parentTypeId) {
      const parentResourceType = await ResourceTypeModel.findById(parentTypeId).exec();
      if (parentResourceType) {
        attributes = attributes.concat(parentResourceType.attributes);
        parentTypeId = parentResourceType.parentType;
      } else {
        break;
      }
    }

    if (requiredOnly) {
      return attributes.filter( (attribute) => {
        return attribute.required;
      });
    }

    return attributes;
  }

  @instanceMethod
  public getEponymousAttribute(): ResourceAttribute | undefined {
    const attributes: ResourceAttribute[] = this.attributes;
    return attributes.find((attribute: any) => {
      return (attribute.name === this.eponymousAttribute);
    });
  }

  @instanceMethod
  public getCostAttribute(): ResourceAttribute | undefined {
    const attributes: ResourceAttribute[] = this.attributes;
    return attributes.find((attribute: any) => {
      return (attribute.name === this.costAttribute);
    });
  }

  @instanceMethod
  public async setParentResourceTypeByName(resourceTypeName: string): Promise<void> {
    const parentResourceType = await ResourceTypeModel.findOne({ name: resourceTypeName });

    if (!parentResourceType) {
      return new Promise((resolve, reject) => {
        reject(new Error(`Failed to find parent resource type definition for '${resourceTypeName}'!`));
      });
    }

    this.parentType = parentResourceType._id;
  }
  // endregion

  // region private methods
  // endregion

}

const ResourceTypeModel = new ResourceType().getModelForClass(ResourceType);

export default ResourceTypeModel;

export const resourceTypeSerializer = new Serializer('resourceType', {
  id: '_id',
  attributes: [
    'name',
    'abstract',
    'attributes',
    'parentType',
    'eponymousAttribute',
    'costAttribute',
  ],
  parentType: {
    ref: '_id',
    type: 'resourceType',
    attributes: [
      'name',
      'abstract',
      'attributes',
      'parentType',
      'eponymousAttribute',
      'costAttribute',
    ],
  },
  keyForAttribute: 'camelCase',
} as any);
