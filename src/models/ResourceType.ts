import { prop, Typegoose, Ref, pre } from 'typegoose';

interface Attribute {
  name: string;
  dataType: string;
  required: boolean;
}

// tslint:disable-next-line:only-arrow-functions
@pre<ResourceType>('save', async function() {
  if (!this.parentType && this.name !== 'Resource') {
    return new Promise((resolve, reject) => {
      reject(new Error(`Parent resource type for new type '${this.name}' must be defined.`));
    });
  }
})

export class ResourceType extends Typegoose {
  @prop({ required: true, unique: true })
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
