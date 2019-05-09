import ResourceType from '@/models/ResourceType';
import winston from 'winston';
import resourceInstances from '@/utils/resourceInstances';
import ResourceInstance from '@/models/ResourceInstance';

export default class RootTypeInitializer {
  // region public static methods
  public static async initializeResourceInstances(): Promise<void> {
    const resourceTypeCount = await ResourceType.find().estimatedDocumentCount();

    if (resourceTypeCount === 0) {
      return;
    }

    winston.info('Begin initializing resourceInstance...');
    for (const instance of resourceInstances) {
      const resource = new ResourceInstance({ attributes: instance.attributes });
      try {
        await resource.setResourceTypeByName(instance.resourceType);
      } catch (error) {
        winston.error(`Resource type ${instance.resourceType} not found.`);
      }

      try {
        await resource.save();
        winston.debug(`saved instance of type ${instance.resourceType}`);
      } catch (error) {
        winston.error(error.message);
        winston.error(`instance for type ${instance.resourceType} could not be initialized. See error above.`);
      }
    }
    winston.info('Finished saving all instances.');
  }
  // endregion

  // region private static methods
  // endregion

  // region public members
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
