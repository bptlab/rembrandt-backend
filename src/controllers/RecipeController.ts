import IngredientController from '@/controllers/IngredientControllerInterface';
import ResourceInstanceModel from '@/models/ResourceInstance';
import IntermediateResult from '@/models/IntermediateResult';
import { Ref } from 'typegoose';
import { ResourceType } from '@/models/ResourceType';
import Ingredient, { InputIngredient, OutputIngredient } from '@/models/IngredientInterface';
import { OptimizationTransformer } from '@/models/OptimizationTransformer';
import { OptimizationAlgorithm } from '@/models/OptimizationAlgorithm';
import AlgorithmController from '@/controllers/AlgorithmController';
import TransformerController from '@/controllers/TransformerController';
import InputController from '@/controllers/InputController';
import OutputController from '@/controllers/OutputController';
import { OptimizationExecution } from '@/models/OptimizationExecution';

export default class RecipeController implements IngredientController {
  // region public static methods
  // endregion

  // region private static methods
  private static getControllerForIngredient(node: Ingredient): IngredientController {
    if (node.ingredientDefinition instanceof OptimizationAlgorithm) {
      return new AlgorithmController(node.ingredientDefinition);
    }
    if (node.ingredientDefinition instanceof OptimizationTransformer) {
      return new TransformerController(node.ingredientDefinition);
    }
    // https://www.typescriptlang.org/docs/handbook/advanced-types.html#using-type-predicates
    if ((node.ingredientDefinition as InputIngredient).inputResourceType !== undefined) {
      return new InputController(node.ingredientDefinition as InputIngredient);
    }
    if ((node.ingredientDefinition as OutputIngredient).outputResourceType !== undefined) {
      return new OutputController(node.ingredientDefinition as OutputIngredient);
    }
    throw new Error(`Could not find proper controller for ingredient of type ${typeof(node.ingredientDefinition)}.`);
  }
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
  private async executeStep() {
    const executedInThisStep: Array<Promise<IntermediateResult> | Promise<OptimizationExecution>> = [];
    this.nodes.forEach((node) => {
      if (node.inputs instanceof IntermediateResult || node.inputs.length === 0) {
        let inputForNode;
        if (node.inputs instanceof IntermediateResult) {
          inputForNode = node.inputs;
        } else {
          inputForNode = new IntermediateResult();
        }
        // CREATE AND START CONTROLLER FOR THIS ONE
        const controller = RecipeController.getControllerForIngredient(node);
        executedInThisStep.push(controller.execute(inputForNode));
      }
    });
    const nodesResults = await Promise.all(executedInThisStep);
  }
  // endregion
}
