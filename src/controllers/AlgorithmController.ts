import { OptimizationAlgorithm } from '@/models/OptimizationAlgorithm';
import winston = require('winston');
import OptimizationExecutionModel, { OptimizationExecution } from '@/models/OptimizationExecution';
import Ingredient from './IngredientInterface';
import DockerController from './DockerController';
import IntermediateResult from '@/models/IntermediateResult';

export default class AlgorithmController implements Ingredient {
  // region public static methods
  // endregion

  // region private static methods
  // endregion

  // region public members
  public optimizationAlgorithm: OptimizationAlgorithm;
  // endregion

  // region private members
  private dockerController: DockerController;
  // endregion

  // region constructor
  constructor(optimizationAlgorithm: OptimizationAlgorithm) {
    this.dockerController = new DockerController();
    this.optimizationAlgorithm = optimizationAlgorithm;
  }
  // endregion

  // region public methods
  public async execute(input: IntermediateResult): Promise<OptimizationExecution> {
    this.writeRequiredAlgorithmInputFiles(input);

    const executionInstance = new OptimizationExecutionModel();
    executionInstance.optimizationAlgorithm = this.optimizationAlgorithm;

    try {
      await executionInstance.save();
      const containerName = executionInstance.containerName;

      this.dockerController.run(
        this.optimizationAlgorithm.imageIdentifier,
        ['/bin/bash', '-c', 'sleep 30s'],
        process.stdout,
        { name: containerName })
        .then((container) => {
          executionInstance.terminate(container.output.StatusCode);
          winston.debug(`Container ${containerName} exited with code ${container.output.StatusCode}`);
        });

      return executionInstance;
    } catch (error) {
      return new Promise((resolve, reject) => {
        reject(
          new Error(`Could not start docker container for algorithm: ${this.optimizationAlgorithm.name}. ${error}`),
        );
      });
    }
  }
  // endregion

  // region private methods
  private writeRequiredAlgorithmInputFiles(input: IntermediateResult) {
    return;
  }
  // endregion
}
