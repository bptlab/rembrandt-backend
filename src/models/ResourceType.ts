import { prop, Typegoose, Ref } from 'typegoose';

interface Attribute {
  name: string;
  dataType: string;
  required: boolean;
}

export class ResourceType extends Typegoose {
  @prop({ required: true })
  public name: string = '';

  @prop({ required: true })
  public abstract: boolean = false;

  @prop({ required: true })
  public attributes: Attribute[] = [];

  @prop({ ref: ResourceType })
  public parentType?: Ref<ResourceType>;
}

const ResourceTypeModel = new ResourceType().getModelForClass(ResourceType);

export default ResourceTypeModel;
