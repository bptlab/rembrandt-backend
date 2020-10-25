import IntermediateResult from '@/models/IntermediateResult';
import Ingredient from '@/models/Ingredient';
import winston = require('winston');
import { OptimizationRecipe } from '@/models/OptimizationRecipe';
import OptimizationExecutionModel, { OptimizationExecution } from '@/models/OptimizationExecution';
import OptimizationExecutionIngredientState from '@/models/OptimizationExecutionIngredientState';
import allocationLogger from '@/utils/allocationLogger';

export default class RecipeController {
  // region public static methods
  public static async createFromOptimizationIngredient(recipe: OptimizationRecipe): Promise<RecipeController> {
    const recipeController = new RecipeController();
    recipeController.name = recipe.name;
    recipeController.execution = new OptimizationExecutionModel();
    recipeController.execution.recipe = recipe;

    const recipeIngredientsPromise = recipe.ingredients.map((ingredient) => {
      const ingredientExecutionState = new OptimizationExecutionIngredientState();
      ingredientExecutionState.ingredient = ingredient;
      recipeController.execution.processingStates.push(ingredientExecutionState);

      return Ingredient.createFromOptimizationIngredient(ingredient);
    });

    recipeController.ingredients = await Promise.all(recipeIngredientsPromise);
    await recipeController.execution.save();
    return recipeController;
  }
  // endregion

  // region private static methods
  // endregion

  // region public members
  public ingredients!: Ingredient[];
  public name!: string;
  public execution!: OptimizationExecution;
  // endregion

  // region private members
  private isExecuted = false;
  // endregion

  // region constructor
  // endregion

  // region public methods
  public async execute(): Promise<void> {
    if (this.isExecuted) {
      throw new Error(`[Recipe '${this.name}'] - Is already executed!`);
    }
    this.isExecuted = true;

    winston.debug(`[Recipe '${this.name}'] - Start execution.`);

    let currentIntermediateResults: IntermediateResult[] = [];

    while (this.ingredients.some((node) => node.isExecutable())) {
      try {
        const executedInStep = this.executeStep();
        await this.execution.save();
        currentIntermediateResults = await executedInStep;
      } catch (error) {
        winston.error(`[Recipe '${this.name}'] - ${error}`);
        winston.error(`[Recipe '${this.name}'] - Aborting execution of recipe.`);
        this.execution.finishedAt = new Date();
        const errorResult = new IntermediateResult();
        errorResult.setError(`[Recipe '${this.name}'] ${error}`);
        this.terminateRecipeExecution(errorResult);
        await this.execution.save();
        return;
      }
      this.tryToResolveFinishedIngredients();
    }
    const response = currentIntermediateResults.reduce(
      (mergedResult, currentInput) =>
        IntermediateResult.merge(mergedResult, currentInput),
      new IntermediateResult({}, true));
    this.terminateRecipeExecution(response);
    await this.execution.save();
    // writing allocation log
    this.execution.result!.getInstanceIdsForAllResourceTypes().forEach((resourceInstance) => {
      allocationLogger.saveInAllocationLog(resourceInstance.toHexString(), this.name, 'Testnull');
    });
    return;
  }
  // endregion

  // region private methods
  /**
   * Iterates over all nodes and executes all nodes that are executable.
   * "Executable" if node has no inputs or all inputs were resolved to an intermediate result.
   *
   * @returns Promise<void[]> that is resolved when all nodes terminated
   */
  private async executeStep(): Promise<IntermediateResult[]> {
    const executedInThisStep: Array<Promise<IntermediateResult>> = [];

    this.ingredients.forEach((node) => {
      if (node.isExecutable()) {
        const inputForNode = (node.inputs instanceof IntermediateResult) ? node.inputs : new IntermediateResult();
        // CREATE AND START CONTROLLER FOR THIS ONE
        const controller = node.instantiateController();

        winston.debug(`[Recipe '${this.name}'] -- Execute controller of type ${node.ingredientType}.`);

        const nodeIdentifier = this.execution.ingredientStarted(node.id);

        executedInThisStep.push(
          controller.execute(inputForNode, `${this.execution.identifier}-${nodeIdentifier}`).then((result) => {
            node.result = result;
            this.execution.ingredientFinished(node.id, true);
            return result;
          }).catch((error) => {
            this.execution.ingredientFinished(node.id, false, error);
            // tslint:disable-next-line: max-line-length
            throw new Error(`Error while executing ${node.ingredientType} controller for ingredient ${node.id}. ${error}`);
          }),
        );
      }
    });
    return Promise.all(executedInThisStep);
  }

  private terminateRecipeExecution(result: IntermediateResult) {
    this.execution.successful = !result.erroneous;
    this.execution.finishedAt = new Date();
    this.execution.result = result;
  }
  // private setExecutionFinished(node: Ingredient) {

  // }

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
