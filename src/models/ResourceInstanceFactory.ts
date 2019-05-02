import { prop, Typegoose, Ref } from 'typegoose';
import ResourceTypeModel, { ResourceType } from '@/models/ResourceType';
import ResourceInstanceModel, {Attribute, ResourceInstance} from '@/models/ResourceInstance';
import winston = require('winston');

export default class ResourceInstanceFactory{
  public static async build(attributes: Attribute[], resourceType: ResourceType ): Promise<ResourceInstance> {
    const foundType = await ResourceTypeModel.findOne({name: resourceType.name }).exec();
    if (!foundType){
      const errorText = 'No corrresponding ResourceType found!';
      winston.error(errorText);
      throw Error(errorText);
    }
    if (foundType.abstract){
      const errorText = 'ResourceType is abstract';
      winston.error(errorText);
      throw Error(errorText);
    }
    const resource = {attributes, resourceType}
    return new ResourceInstanceModel(resource);
  }
