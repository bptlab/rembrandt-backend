import IngredientController from '@/controllers/ingredients/IngredientControllerInterface';
import ResourceInstanceModel, { ResourceInstance } from '@/models/ResourceInstance';
import IntermediateResult from '@/models/IntermediateResult';
import { Ref } from 'typegoose';
import { ResourceType } from '@/models/ResourceType';
import { InputIngredient } from '@/models/Ingredient';

export default class InputController implements IngredientController {
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
  constructor(input: InputIngredient) {
    this.resourceType = input.inputResourceType;
  }
  // endregion

  // region public methods
  public async execute(): Promise<IntermediateResult> {
    const resourceInstances = await ResourceInstanceModel
      .find({ resourceType: this.resourceType })
      .lean()
      .exec();

    resourceInstances.forEach((instance: ResourceInstance) => {
      instance.attributes = ResourceInstance.convertAttributeArrayToObject(instance.attributes);
      instance.id = instance._id;
      delete instance._id;
      delete instance.__v;
    });

    const response = new IntermediateResult();
    response.addResultsForResourceType(this.resourceType, resourceInstances);
    response.finish();
    return response;
  }
  // endregion

  // region private methods
  // endregion
}
