import ResourceTypeModel from '@/models/ResourceType';
import ResourceInstanceModel, { Attribute } from '@/models/ResourceInstance';
import Winston from 'winston';

export default class ResourceInstanceFactory {
  public static async build(attributes: Attribute[], resourceTypeName: string ): Promise<InstanceType<any>> {
    Winston.info('inside the factory');
    const foundType = await ResourceTypeModel.findOne({name: resourceTypeName }).exec();
    if (!foundType) {
      const errorText = 'No corrresponding ResourceType found!';
      Winston.error(errorText);
      throw Error(errorText);
    }
    if (foundType.abstract) {
      const errorText = 'ResourceType is abstract!';
      Winston.error(errorText);
      throw Error(errorText);
    }
    const resource = {attributes, resourceType: foundType._id};
    return new ResourceInstanceModel(resource);
  }
}
