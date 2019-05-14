import { prop, Typegoose, Ref, pre, instanceMethod } from 'typegoose';
import { Serializer } from 'jsonapi-serializer';
import winston = require('winston');

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

/*export const resourceTypeSerializer = new Serializer('resourceType', {
  id: '_id',
  attributes: [
    'name',
    'abstract',
    'attributes',
    'parentType',
  ],
  keyForAttribute: 'camelCase',
});
*/
