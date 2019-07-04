import Docker from 'dockerode';
import { OptimizationAlgorithm } from '@/models/OptimizationAlgorithm';
import config from '@/config.json';
import winston = require('winston');
import OptimizationExecutionModel, { OptimizationExecution } from '@/models/OptimizationExecution';
import Ingredient from './IngredientInterface';

export default class AlgorithmController implements Ingredient {
  // region public static methods
  public static getImageNameForExecution(executionInstance: OptimizationExecution) {
    return AlgorithmController.imageNamePrefix + executionInstance.identifier;
  }
  // endregion

  // region private static methods
  private static imageNamePrefix = 'rembrandt-';
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

  public stopExecution(executionInstance: OptimizationExecution) {
    const containerName = AlgorithmController.getImageNameForExecution(executionInstance);
    winston.debug(`Stopping ${containerName}`);
    const container = this.docker.getContainer(AlgorithmController.getImageNameForExecution(executionInstance));
    container.stop();
  }

  public async stopAndRemoveAll() {
    winston.info('Stopping all containers...');
    const containers = await this.docker.listContainers({ all: true });
    const containerStopStatus: Array<Promise<void>> = [];
    containers.forEach((containerInfo) => {
      if (containerInfo.Names.some((name) => name.startsWith('/' + AlgorithmController.imageNamePrefix))) {
        containerStopStatus.push(this.stopAndRemoveOne(containerInfo));
      }
    });
    await Promise.all(containerStopStatus);
    winston.info(`Stopped and removed all rembrandt containers (${containerStopStatus.length}).`);
  }

  public async stopAndRemoveOne(containerInfo: Docker.ContainerInfo): Promise<void> {
    try {
      const container = this.docker.getContainer(containerInfo.Id);
      if (containerInfo.State === 'running') {
        winston.debug(`Stopping container ${containerInfo.Names[0]} (${containerInfo.Id})`);
        await container.stop();
      }
      winston.debug(`Removing container ${containerInfo.Names[0]} (${containerInfo.Id})`);
      await container.remove();
    } catch (error) {
      winston.error(error);
    }
  }
  // endregion

  // region private methods
  // endregion
}
