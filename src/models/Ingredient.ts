import OptimizationTransformerModel, { OptimizationTransformer } from './OptimizationTransformer';
import OptimizationAlgorithmModel, { OptimizationAlgorithm } from './OptimizationAlgorithm';
import { Ref } from 'typegoose';
import { ResourceType } from './ResourceType';
import IntermediateResult from './IntermediateResult';
import IngredientController from '@/controllers/IngredientControllerInterface';
import AlgorithmController from '@/controllers/AlgorithmController';
import TransformerController from '@/controllers/TransformerController';
import InputController from '@/controllers/InputController';
import OutputController from '@/controllers/OutputController';
import winston = require('winston');

export interface InputIngredient {
  inputResourceType: Ref<ResourceType>;
}

export interface OutputIngredient {
  outputResourceType: Ref<ResourceType>;
}

export default class Ingredient {
  // region public static methods
  // endregion

  // region private static methods
  // endregion

  // region public members
  public inputs: Ingredient[] | IntermediateResult = [];
  public outputs: Ingredient[] = [];
  public ingredientDefinition: OptimizationTransformer | OptimizationAlgorithm | InputIngredient | OutputIngredient;
  public result: IntermediateResult | undefined = undefined;
  // endregion

  // region private members
  // endregion

  // region constructor
  constructor(ingredientDefinition: OptimizationTransformer | OptimizationAlgorithm |
    InputIngredient | OutputIngredient) {

    this.ingredientDefinition = ingredientDefinition;
  }
  // endregion

  // region public methods
  public isExecutable(): boolean {
    if (this.result) {
      return false;
    }
    if (this.inputs instanceof IntermediateResult || this.inputs.length === 0) {
      return true;
    }
    return false;
  }

  public instantiateController(): IngredientController {
    if (this.ingredientDefinition instanceof OptimizationAlgorithmModel) {
      return new AlgorithmController(this.ingredientDefinition as OptimizationAlgorithm);
    }
    if (this.ingredientDefinition instanceof OptimizationTransformerModel) {
      return new TransformerController(this.ingredientDefinition as OptimizationTransformer);
    }
    // https://www.typescriptlang.org/docs/handbook/advanced-types.html#using-type-predicates
    if ((this.ingredientDefinition as InputIngredient).inputResourceType !== undefined) {
      return new InputController(this.ingredientDefinition as InputIngredient);
    }
    if ((this.ingredientDefinition as OutputIngredient).outputResourceType !== undefined) {
      return new OutputController(this.ingredientDefinition as OutputIngredient);
    }
    throw new Error(`Could not find proper controller for ingredient of type ${typeof (this.ingredientDefinition)}.`);
  }
  // endregion

  // region private methods
  // endregion
}
