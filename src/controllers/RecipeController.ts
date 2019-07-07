import IngredientController from '@/controllers/IngredientControllerInterface';
import ResourceInstanceModel from '@/models/ResourceInstance';
import IntermediateResult from '@/models/IntermediateResult';
import { Ref } from 'typegoose';
import { ResourceType } from '@/models/ResourceType';
import Ingredient from '@/models/IngredientInterface';

export default class RecipeController implements IngredientController {
  // region public static methods
  // endregion

  // region private static methods
  // endregion

  // region public members
  public nodes: Ingredient[];
  // endregion

  // region private members
  // endregion

  // region constructor
  constructor(nodes: Ingredient[]) {
    this.nodes = nodes;
  }
  // endregion

  // region public methods
  public async execute(): Promise<IntermediateResult> {


    const response = new IntermediateResult();
    return response;
  }
  // endregion

  // region private methods
  // endregion
}
