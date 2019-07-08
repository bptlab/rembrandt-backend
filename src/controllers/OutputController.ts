import IngredientController from '@/controllers/IngredientControllerInterface';
import ResourceInstanceModel from '@/models/ResourceInstance';
import IntermediateResult from '@/models/IntermediateResult';
import { Ref } from 'typegoose';
import { ResourceType } from '@/models/ResourceType';
import { OutputIngredient } from '@/models/IngredientInterface';

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
  public async execute(): Promise<IntermediateResult> {
    // TODO
    const response = new IntermediateResult();
    return response;
  }
  // endregion

  // region private methods
  // endregion
}
