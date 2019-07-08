import { OptimizationTransformer } from './OptimizationTransformer';
import { OptimizationAlgorithm } from './OptimizationAlgorithm';
import { Ref } from 'typegoose';
import { ResourceType } from './ResourceType';
import IntermediateResult from './IntermediateResult';

export interface InputIngredient {
  inputResourceType: Ref<ResourceType>;
}

export interface OutputIngredient {
  outputResourceType: Ref<ResourceType>;
}

export default interface Ingredient {
  // region public static methods
  // endregion

  // region private static methods
  // endregion

  // region public members
  inputs: Ingredient[] | IntermediateResult;
  outputs: Ingredient[] | IntermediateResult;
  ingredientDefinition: OptimizationTransformer | OptimizationAlgorithm | InputIngredient | OutputIngredient;
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
