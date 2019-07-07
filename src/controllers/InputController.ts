import IngredientController from '@/controllers/IngredientControllerInterface';
import ResourceInstanceModel from '@/models/ResourceInstance';
import IntermediateResult from '@/models/IntermediateResult';
import { Ref } from 'typegoose';
import { ResourceType } from '@/models/ResourceType';

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
  constructor(resourceType: Ref<ResourceType>) {
    this.resourceType = resourceType;
  }
  // endregion

  // region public methods
  public async execute(): Promise<IntermediateResult> {
    const resourceInstances = await ResourceInstanceModel
      .find({ resourceType: this.resourceType })
      .exec();
    const response = new IntermediateResult();
    response.addResultsForResourceType(this.resourceType, resourceInstances);
    return response;
  }
  // endregion

  // region private methods
  // endregion
}
