import { prop, Typegoose, Ref, pre, instanceMethod } from 'typegoose';
import ResourceTypeModel, { ResourceType, Attribute } from '@/models/ResourceType';
import winston from 'winston';

export interface AttributeValue {
  name: string;
  value: string;
}

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

  const requiredAttributes: Attribute[] = await foundType.getCompleteListOfAttributes(true);
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

export class ResourceInstance extends Typegoose {
  // region public static methods
  // endregion

  // region private static methods
  // endregion

  // region public members
  @prop({ required: true })
  public attributes: AttributeValue[] = [];

  @prop({ required: true, ref: ResourceType })
  public resourceType?: Ref<ResourceType>;
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
      const errorText = 'No corrresponding ResourceType found!';
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
