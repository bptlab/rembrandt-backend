import IngredientController from '@/controllers/IngredientControllerInterface';
import ResourceInstanceModel from '@/models/ResourceInstance';
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
      .exec();
    const response = new IntermediateResult();
    response.addResultsForResourceType(this.resourceType, resourceInstances);
    response.finish();
    return response;
  }
  // endregion

  // region private methods
  // endregion
}
