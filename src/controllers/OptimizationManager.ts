import Docker from 'dockerode';
import { OptimizationAlgorithm } from '@/models/OptimizationAlgorithm';
import config from '@/config.json';
import winston = require('winston');
import OptimizationExecutionModel, { OptimizationExecution } from '@/models/OptimizationExecution';

export default class OptimizationManager {
  // region public static methods
  public static getImageNameForExecution(executionInstance: OptimizationExecution) {
    return OptimizationManager.imageNamePrefix + executionInstance.identifier;
  }
  // endregion

  // region private static methods
  private static imageNamePrefix = 'rembrandt-';
  // endregion

  // region public members
  public optimizationAlgorithm?: OptimizationAlgorithm;
  // endregion

  // region private members
  private docker!: Docker;
  // endregion

  // region constructor
  constructor() {
    this.docker = new Docker(config.docker);
  }
  // endregion

  // region public methods
  public async run(optimizationAlgorithm: OptimizationAlgorithm): Promise<OptimizationExecution> {
    if (!this.docker) {
      return new Promise((resolve, reject) => {
        reject(new Error('No docker connection!'));
      });
    }

    this.optimizationAlgorithm = optimizationAlgorithm;
    const executionInstance = new OptimizationExecutionModel();
    executionInstance.optimizationAlgorithm = optimizationAlgorithm;

    try {
      await executionInstance.save();
      const containerName = OptimizationManager.getImageNameForExecution(executionInstance);

      this.docker.run(
        this.optimizationAlgorithm.imageIdentifier,
        ['/bin/bash', '-c', 'sleep 10s'],
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
        reject(new Error(`Could not start docker container for algorithm: ${optimizationAlgorithm.name}. ${error}`));
      });
    }
  }

  public async stopAndRemoveAll() {
    winston.info('Stopping all containers...');
    const containers = await this.docker.listContainers({ all: true });
    const containerStopStatus: Array<Promise<void>> = [];
    containers.forEach((containerInfo) => {
      if (containerInfo.Names.some((name) => name.startsWith('/' + OptimizationManager.imageNamePrefix))) {
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