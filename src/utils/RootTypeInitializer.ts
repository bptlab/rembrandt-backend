import ResourceType from '@/models/ResourceType';
import rootTypes from '@/utils/rootTypes';

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
    if (resourceTypeCount === 0) {
      for (const rootType of rootTypes) {
        const resourceRootType = new ResourceType(rootType);
        await resourceRootType.save();
      }
    }
  }
  // endregion

  // region private methods
  // endregion
}
