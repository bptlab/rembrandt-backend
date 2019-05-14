import { prop, Typegoose } from 'typegoose';

export class ResourceAttribute extends Typegoose {
  // region public static methods
  // endregion

  // region private static methods
  // endregion

  // region public members
  @prop({ required: true })
  public name: string = '';

  @prop({ required: true })
  public dataType: string = '';

  @prop({ required: true })
  public required: boolean = false;
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

const ResourceAttributeModel = new ResourceAttribute().getModelForClass(ResourceAttribute);

export default ResourceAttributeModel;
