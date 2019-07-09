import IngredientController from '@/controllers/IngredientControllerInterface';
import ResourceInstanceModel, { ResourceInstance } from '@/models/ResourceInstance';
import IntermediateResult from '@/models/IntermediateResult';
import { Ref } from 'typegoose';
import { ResourceType } from '@/models/ResourceType';
import { OutputIngredient } from '@/models/Ingredient';
import { ObjectId } from 'bson';

export default class OutputController implements IngredientController {
  // region public static methods
  // endregion

  // region private static methods
  // endregion

  // region public members
  public resourceType: Ref<ResourceType>;
  // endregion

  // region private members
  // endregion

  // region constructor
  constructor(output: OutputIngredient) {
    this.resourceType = output.outputResourceType;
  }
  // endregion

  // region public methods
  public async execute(input: IntermediateResult): Promise<IntermediateResult> {
    Object.keys(input.data).forEach((resourceTypeId) => {
      const resourceTypeRef = new ObjectId(resourceTypeId);

      input.data[resourceTypeId].forEach((newInstance) => {
        const newResourceInstance = new ResourceInstanceModel();

        newResourceInstance.attributes = ResourceInstance.convertAttributeObjectToArray(newInstance.attributes);
        newResourceInstance.resourceType = resourceTypeRef;

        newResourceInstance.save();
      });
    });
    const response = new IntermediateResult({}, true);
    return response;
  }
  // endregion

  // region private methods
  // endregion
}
