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
      winston.debug(' +- Clean up recipe tree');
      this.cleanUpResolvedNodes();
      winston.debug(' + Finished step');
    }
    winston.debug('Finished executing recipe.');
    winston.debug('==========================');
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

    this.nodes.forEach((node) => {
      if (node.isExecutable()) {
        const inputForNode = (node.inputs instanceof IntermediateResult) ? node.inputs : new IntermediateResult();
        // CREATE AND START CONTROLLER FOR THIS ONE
        const controller = node.instantiateController();
        winston.debug(` +-- Create controller of type ${typeof controller}`);

        executedInThisStep.push(
          controller.execute(inputForNode).then((result) => {
            winston.debug(` +-- Executed controller of type ${typeof controller}`);
            node.result = result;
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
    this.nodes.forEach((node) => {
      if (node.isReadyToResolve()) {
        node.inputs = (node.inputs as Ingredient[]).reduce(
          (mergedResult, currentInput) =>
            IntermediateResult.merge(mergedResult, currentInput.result as IntermediateResult),
          new IntermediateResult({}, true));
      }
    });
  }

  /**
   * Iterates over all nodes. If a node was already executed and the subsequent node too,
   * we can safely remove the node from the list
   */
  private cleanUpResolvedNodes(): void {
    this.nodes = this.nodes.filter((node) => {
      return (!(node.result && node.outputs.every((output) => (output.result !== undefined))))
        || node.outputs.length === 0;
    });
  }
  // endregion
}
