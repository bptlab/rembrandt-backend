import Docker from 'dockerode';
import { OptimizationAlgorithm } from '@/models/OptimizationAlgorithm';
import config from '@/config.json';
import winston = require('winston');
import OptimizationExecutionModel, { OptimizationExecution } from '@/models/OptimizationExecution';
import Ingredient from './IngredientInterface';

export default class AlgorithmController implements Ingredient {
  // region public static methods
  public static getImageNameForExecution(executionInstance: OptimizationExecution) {
    return config.docker.containerPrefix + executionInstance.identifier;
  }
  // endregion

  // region private static methods
  // endregion

  // region public members
  public optimizationAlgorithm: OptimizationAlgorithm;
  // endregion

  // region private members
  private docker: Docker;
  // endregion

  // region constructor
  constructor(optimizationAlgorithm: OptimizationAlgorithm) {
    this.docker = new Docker(config.docker.configuration);
    this.optimizationAlgorithm = optimizationAlgorithm;
  }
  // endregion

  // region public methods
  public async execute(): Promise<OptimizationExecution> {
    if (!this.docker) {
      return new Promise((resolve, reject) => {
        reject(new Error('No docker connection!'));
      });
    }

    const executionInstance = new OptimizationExecutionModel();
    executionInstance.optimizationAlgorithm = this.optimizationAlgorithm;

    try {
      await executionInstance.save();
      const containerName = AlgorithmController.getImageNameForExecution(executionInstance);

      this.docker.run(
        this.optimizationAlgorithm.imageIdentifier,
        ['/bin/bash', '-c', 'sleep 30s'],
        process.stdout,
        { name: containerName })
        .then((container) => {
          executionInstance.finishedAt = new Date();
          executionInstance.terminationCode = container.output.StatusCode;
          executionInstance.save();
          winston.debug(`Container ${containerName} exited with code ${container.output.StatusCode}`);
        });

      return executionInstance;
      } catch (error) {
        return new Promise((resolve, reject) => {
          reject(
            new Error(`Could not start docker container for algorithm: ${this.optimizationAlgorithm.name}. ${error}`)
          );
        });
    }
  }
  // endregion

  // region private methods
  // endregion
}
