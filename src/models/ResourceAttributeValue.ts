import { prop, Typegoose } from 'typegoose';

export class ResourceAttributeValue extends Typegoose {
  // region public static methods
  // endregion

  // region private static methods
  // endregion

  // region public members
  @prop({ required: true })
  public name: string = '';

  @prop({ required: true })
  public value: string = '';
  // endregion

  // region private members
  // endregion

  // region constructor
  // endregion

  // region public methods
  // endregion

  // region private methods
  // endregion

}

const ResourceAttributeValueModel = new ResourceAttributeValue().getModelForClass(ResourceAttributeValue);

export default ResourceAttributeValueModel;
