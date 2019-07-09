import IngredientController from '@/controllers/IngredientControllerInterface';
import IntermediateResult from '@/models/IntermediateResult';
import Ingredient from '@/models/Ingredient';
import winston = require('winston');

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

    winston.debug('=======================');
    winston.debug('Start executing recipe.');

    while (this.nodes.some((node) => node.isExecutable())) {
      winston.debug(' + Executing another step');
      winston.debug(' +- Start execution');
      await this.executeStep();
      winston.debug(' +- Start resolving');
      this.tryToResolveFinishedIngredients();
      winston.debug(' + Finished step');
    }
    winston.debug('Finished executing recipe.');
    winston.debug('==========================');
    const response = new IntermediateResult();
    return response;
  }
  // endregion

  // region private methods
  private async executeStep(): Promise<void[]> {
    const executedInThisStep: Array<Promise<void>> = [];

    this.nodes.forEach((node) => {
      if (node.isExecutable()) {
        winston.debug(` +-- Found executable node of type ${typeof node.ingredientDefinition}`);
        const inputForNode = (node.inputs instanceof IntermediateResult) ? node.inputs : new IntermediateResult();
        // CREATE AND START CONTROLLER FOR THIS ONE
        const controller = node.instantiateController();

        executedInThisStep.push(
          controller.execute(inputForNode).then((result) => {
            winston.debug(` +-- Finished node of type ${typeof node.ingredientDefinition}`);
            node.result = result;
          }),
        );
      }
    });
    return Promise.all(executedInThisStep);
  }

  private tryToResolveFinishedIngredients(): void {
    this.nodes.forEach((node) => {
      if (node.inputs instanceof IntermediateResult || node.inputs.length === 0) {
        return;
      }
      if (node.inputs.every((input) => input.result !== undefined)) {
        node.inputs = node.inputs.reduce(
          (mergedResult, currentInput) =>
            IntermediateResult.merge(mergedResult, currentInput.result as IntermediateResult),
          new IntermediateResult({}, true));
      }
    });
  }
  // endregion
}
