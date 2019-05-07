import ResourceType from '@/models/ResourceType';
import rootTypes from '@/utils/rootTypes';
import Winston from 'winston';
import ResourceInstanceFactory from '@/models/ResourceInstanceFactory';
import resourceInstances from '@/utils/resourceInstances';
import ResourceInstance from '@/models/ResourceInstance';

export default class RootTypeInitializer {
  // region public static methods
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
  public static async initializeResourceInstance(): Promise<void> {
    const resourceTypeCount = await ResourceType.find().estimatedDocumentCount();

    if (resourceTypeCount === 0) {
      return;
    }

    Winston.info('Begin initializing resourceInstance...');
    for (const instance of resourceInstances) {
      const resource = new ResourceInstance({ attributes: instance.attributes });
      await resource.setResourceTypeByName(instance.resourceType);
      Winston.info('before ');
      // await ResourceInstanceFactory.build(instance.attributes, instance.resourceType);
      try {
        await resource.save();
        Winston.debug(`saved instance of type ${instance.resourceType}`);
      } catch (error) {
        Winston.error(error.message);
        Winston.error(`instance for type ${instance.resourceType} could not be initialized. See error above.`);
      }
    }
    Winston.info('Finished saving all instances.');
  }
  // endregion

  // region private methods
  // endregion
}
