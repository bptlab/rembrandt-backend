import { prop, Typegoose, Ref, pre } from 'typegoose';
import ResourceTypeModel, { ResourceType } from '@/models/ResourceType';

export interface Attribute {
  name: string;
  value: string;
}


export class ResourceInstance extends Typegoose {

  @prop({ required: true })
  public attributes: Attribute[] = [];


  @prop({ required: true, ref: ResourceType })
  public resourceType?: Ref<ResourceType>;

}


const ResourceInstanceModel = new ResourceInstance().getModelForClass(ResourceInstance);

export default ResourceInstanceModel;
