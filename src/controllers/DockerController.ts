import Docker from 'dockerode';
import { OptimizationAlgorithm } from '@/models/OptimizationAlgorithm';
import config from '@/config.json';
import winston = require('winston');
import OptimizationExecutionModel, { OptimizationExecution } from '@/models/OptimizationExecution';
import Ingredient from './IngredientInterface';

export default class DockerController {
  // region public static methods
  public static getImageNameForExecution(executionInstance: OptimizationExecution) {
    return config.docker.containerPrefix + executionInstance.identifier;
  }
  // endregion

  // region private static methods
  private static imageNamePrefix = 'rembrandt-';
  // endregion

  // region public members
  // endregion

  // region private members
  private docker: Docker;
  // endregion

  // region constructor
  constructor() {
    this.docker = new Docker(config.docker.configuration);
  }
  // endregion

  // region public methods
  public stopExecution(executionInstance: OptimizationExecution) {
    const containerName = DockerController.getImageNameForExecution(executionInstance);
    winston.debug(`Stopping ${containerName}`);
    const container = this.docker.getContainer(DockerController.getImageNameForExecution(executionInstance));
    container.stop();
  }

  public async stopAndRemoveAll() {
    winston.info('Stopping all containers...');
    const containers = await this.docker.listContainers({ all: true });
    const containerStopStatus: Array<Promise<void>> = [];
    containers.forEach((containerInfo) => {
      if (containerInfo.Names.some((name) => name.startsWith('/' + config.docker.containerPrefix))) {
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
