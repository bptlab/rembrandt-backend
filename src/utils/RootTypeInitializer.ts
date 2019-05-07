import ResourceType from '@/models/ResourceType';
import rootTypes from '@/utils/rootTypes';
import winston from 'winston';



export default class RootTypeInitializer {
  // region public static methods
  public static async initializeRootTypes(): Promise<void> {
    const resourceTypeCount = await ResourceType.find().estimatedDocumentCount();

    if (resourceTypeCount !== 0) {
      return;
    }

    winston.info('Begin initializing root types...');

    for (const rootType of rootTypes) {
      const resourceRootType = new ResourceType(rootType);

      try {
        if (rootType.parentType) {
          await resourceRootType.setParentResourceTypeByName(rootType.parentType);
        }
        await resourceRootType.save();
        winston.debug(`Initialized '${rootType.name}' type.`);
      } catch (error) {
        winston.error(error.message);
        winston.error(`'${rootType.name}' could not be initialized. See error above.`);
      }
    }

    winston.info('Finished initializing root types.');
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
