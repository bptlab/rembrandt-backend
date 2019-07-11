import OptimizationTransformerModel, { OptimizationTransformer } from '@/models/OptimizationTransformer';
import OptimizationAlgorithmModel, { OptimizationAlgorithm } from '@/models/OptimizationAlgorithm';
import { Ref } from 'typegoose';
import { ResourceType } from './ResourceType';
import IntermediateResult from './IntermediateResult';
import IngredientController from '@/controllers/IngredientControllerInterface';
import AlgorithmController from '@/controllers/AlgorithmController';
import TransformerController from '@/controllers/TransformerController';
import InputController from '@/controllers/InputController';
import OutputController from '@/controllers/OutputController';
import OptimizationIngredient, { IngredientType } from './OptimizationIngredient';
import { getIdFromRef } from '@/utils/utils';

export interface InputIngredient {
  inputResourceType: Ref<ResourceType>;
}

export interface OutputIngredient {
  outputResourceType: Ref<ResourceType>;
}

export default class Ingredient {
  // region public static methods
  public static async createFromOptimizationIngredient(
    optimizationIngredient: OptimizationIngredient): Promise<Ingredient>  {

    const newIngredient = new Ingredient(optimizationIngredient);
    newIngredient.ingredientDefinition = await OptimizationIngredient.getIngredientObject(optimizationIngredient);
    return newIngredient;
  }
  // endregion

  // region private static methods
  // endregion

  // region public members
  public id: string = '';
  public inputs: string[] | IntermediateResult = [];
  public ingredientDefinition!: OptimizationTransformer | OptimizationAlgorithm | InputIngredient | OutputIngredient;
  public ingredientType: IngredientType;
  public result: IntermediateResult | undefined = undefined;
  // endregion

  // region private members
  // endregion

  // region constructor
  private constructor(optimizationIngredient: OptimizationIngredient) {
    this.id = optimizationIngredient.id;
    this.ingredientType = optimizationIngredient.ingredientType;
    this.inputs = optimizationIngredient.inputs.map((input) => getIdFromRef(input));
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
    switch (this.ingredientType) {
      case IngredientType.ALGORITHM:
        return new AlgorithmController(this.ingredientDefinition as OptimizationAlgorithm);
      case IngredientType.TRANSFORM:
        return new TransformerController(this.ingredientDefinition as OptimizationTransformer);
      case IngredientType.INPUT:
        if ((this.ingredientDefinition as InputIngredient).inputResourceType !== undefined) {
          return new InputController(this.ingredientDefinition as InputIngredient);
        }
        break;
      case IngredientType.OUTPUT:
        if ((this.ingredientDefinition as OutputIngredient).outputResourceType !== undefined) {
          return new OutputController(this.ingredientDefinition as OutputIngredient);
        }
        break;
    }
    throw new Error(`Could not find proper controller for ingredient ${this.id} of type ${this.ingredientType}.`);
  }
  // endregion

  // region private methods
  // endregion
}
