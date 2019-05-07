import { prop, Typegoose, Ref, pre, instanceMethod } from 'typegoose';
import ResourceTypeModel, { ResourceType } from '@/models/ResourceType';
import Winston from 'winston';

export interface Attribute {
  name: string;
  value: string;
}


@pre<ResourceInstance>('save', async function() {

  const foundType = await ResourceTypeModel.findById( this.resourceType ).exec();
  if (!foundType) {
    const errorText = 'No corrresponding ResourceType found!';
    Winston.error(errorText);
    return new Promise((resolve, reject) => {
      reject(new Error(errorText));
    });
  }
  if (foundType.abstract) {
    const errorText = 'ResourceType is abstract!';
    Winston.error(errorText);
    return new Promise((resolve, reject) => {
      reject(new Error(errorText));
    });
  }
})

export class ResourceInstance extends Typegoose {

  @prop({ required: true })
  public attributes: Attribute[] = [];


  @prop({ required: true, ref: ResourceType })
  public resourceType?: Ref<ResourceType>;

  @instanceMethod
  public async setResourceTypeByName(resourceTypeName: string): Promise<void> {
    const foundType = await ResourceTypeModel.findOne({name: resourceTypeName }).exec();
    if (!foundType) {
      const errorText = 'No corrresponding ResourceType found!';
      Winston.error(errorText);
      throw Error(errorText);
    }
    this.resourceType = foundType._id;
  }

}


const ResourceInstanceModel = new ResourceInstance().getModelForClass(ResourceInstance);

export default ResourceInstanceModel;
