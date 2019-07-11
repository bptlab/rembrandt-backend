import IngredientController from '@/controllers/IngredientControllerInterface';
import IntermediateResult from '@/models/IntermediateResult';
import Ingredient from '@/models/Ingredient';
import winston = require('winston');
import { OptimizationRecipe } from '@/models/OptimizationRecipe';

export default class RecipeController implements IngredientController {
  // region public static methods
  public static async createFromOptimizationIngredient(recipe: OptimizationRecipe) {
    const recipeController = new RecipeController();
    recipeController.name = recipe.name;
    const recipeIngredientsPromise = recipe.ingredients.map((ingredient) => {
      return Ingredient.createFromOptimizationIngredient(ingredient);
    });
    recipeController.ingredients = await Promise.all(recipeIngredientsPromise);
    return recipeController;
  }
  // endregion

  // region private static methods
  // endregion

  // region public members
  public ingredients!: Ingredient[];
  public name!: string;
  // endregion

  // region private members
  // endregion

  // region constructor
  // endregion

  // region public methods
  public async execute(): Promise<IntermediateResult> {

    winston.debug(`[Recipe '${this.name}'] - Start execution.`);

    while (this.ingredients.some((node) => node.isExecutable())) {
      try {
        await this.executeStep();
      } catch (error) {
        winston.error(`[Recipe '${this.name}'] - ${error}`);
        winston.error(`[Recipe '${this.name}'] - Aborting execution of recipe.`);
        const errorResult = new IntermediateResult();
        errorResult.setError(`[Recipe '${this.name}'] ${error}`);
        return errorResult;
      }
      this.tryToResolveFinishedIngredients();
    }
    winston.debug(`[Recipe '${this.name}'] - Finished execution.`);
    const response = new IntermediateResult();
    return response;
  }
  // endregion

  // region private methods
  /**
   * Iterates over all nodes and executes all nodes that are executable.
   * "Executable" if node has no inputs or all inputs were resolved to an intermediate result.
   *
   * @returns Promise<void[]> that is resolved when all nodes terminated
   */
  private async executeStep(): Promise<void[]> {
    const executedInThisStep: Array<Promise<void>> = [];

    this.ingredients.forEach((node) => {
      if (node.isExecutable()) {
        const inputForNode = (node.inputs instanceof IntermediateResult) ? node.inputs : new IntermediateResult();
        // CREATE AND START CONTROLLER FOR THIS ONE
        const controller = node.instantiateController();
        winston.debug(`[Recipe '${this.name}'] -- Execute controller of type ${node.ingredientType}.`);

        executedInThisStep.push(
          controller.execute(inputForNode).then((result) => {
            node.result = result;
          }).catch((error) => {
            // tslint:disable-next-line: max-line-length
            throw new Error(`Error while executing ${node.ingredientType} controller for ingredient ${node.id}. ${error}`);
          }),
        );
      }
    });
    return Promise.all(executedInThisStep);
  }

  /**
   * Iterates over all nodes. If a node is detected where all inputs have a result, these results are merged.
   * The resulting IntermediateResult, containing all results of the inputs, is used as new input for the node.
   */
  private tryToResolveFinishedIngredients(): void {
    this.ingredients.forEach((node) => {
      if (this.isReadyToResolve(node)) {
        node.inputs = this.getInputIngredientsOfNode(node).reduce(
          (mergedResult, currentInput) =>
            IntermediateResult.merge(mergedResult, currentInput.result as IntermediateResult),
          new IntermediateResult({}, true));
      }

    });
  }

  private isReadyToResolve(node: Ingredient): boolean {
    if (node.inputs instanceof IntermediateResult || node.inputs.length === 0) {
      return false;
    }
    return this.getInputIngredientsOfNode(node).every((input) => {
      return input.result !== undefined;
    });
  }

  private getInputIngredientsOfNode(node: Ingredient): Ingredient[] {
    if (node.inputs instanceof IntermediateResult) {
      return [];
    }
    return this.ingredients.filter((ingredient) => (node.inputs as string[]).includes(ingredient.id));
  }
  // endregion
}
