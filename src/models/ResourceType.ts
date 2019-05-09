import { prop, Typegoose, Ref, pre, instanceMethod } from 'typegoose';
import { Serializer } from 'jsonapi-serializer';

export interface Attribute {
  name: string;
  dataType: string;
  required: boolean;
}

// tslint:disable-next-line:only-arrow-functions
@pre<ResourceType>('save', async function(): Promise<void> {
  if (!this.parentType && this.name !== 'Resource') {
    return new Promise((resolve, reject) => {
      reject(new Error(`Parent resource type for new type '${this.name}' must be defined.`));
    });
  }
})

export class ResourceType extends Typegoose {
  // region public static methods
  // endregion

  // region private static methods
  // endregion

  // region public members
  @prop({ required: true, unique: true })
  public name: string = '';

  @prop({ required: true })
  public abstract: boolean = false;

  @prop({ required: true })
  public attributes: Attribute[] = [];

  @prop({ ref: ResourceType })
  public parentType?: Ref<ResourceType>;
  // endregion

  // region private members
  // endregion

  // region constructor
  // endregion

  // region public methods

  @instanceMethod
  public async getCompleteListOfAttributes(requiredOnly: boolean = false): Promise<Attribute[]> {
    let attributes: Attribute[] = this.attributes;
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
  ],
});
