import ResourceType from '@/models/ResourceType';
import rootTypes from '@/utils/rootTypes';
import Winston from 'winston';

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
  public static async initializeRootTypes(): Promise<void> {
    const resourceTypeCount = await ResourceType.find().estimatedDocumentCount();

    if (resourceTypeCount !== 0) {
      return;
    }

    Winston.info('Begin initializing root types...');

    for (const rootType of rootTypes) {
      const resourceRootType = new ResourceType(rootType);

      if (rootType.parentType) {
        const parentResourceType = await ResourceType.findOne({ name: rootType.parentType });
        if (!parentResourceType) {
          Winston.warn(
            `Failed to find parent resource type definition for '${rootType.name}'!
            Please ensure the types are correctly ordered.
            Skipping this type.`);
          continue;
        }
        resourceRootType.parentType = parentResourceType._id;
      }
      try {
        await resourceRootType.save();
        Winston.debug(`Initialized '${rootType.name}' type.`);
      } catch (error) {
        Winston.error(error.message);
        Winston.error(`'${rootType.name}' could not be initialized. See error above.`);
      }
    }

    Winston.info('Finished initializing root types.');
  }
  // endregion

  // region private methods
  // endregion
}
