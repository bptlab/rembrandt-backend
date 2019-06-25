import Docker from 'dockerode';
import { OptimizationAlgorithm } from '@/models/OptimizationAlgorithm';
import config from '@/config.json';
import winston = require('winston');

export default class OptimizationExecution {
  // region public static methods
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
  public async run(optimizationAlgorithm: OptimizationAlgorithm) {
    this.optimizationAlgorithm = optimizationAlgorithm;
    if (!this.docker) {
      return;
    }

    try {
      // Image: this.optimizationAlgorithm.getImageIdentifier(),
      const container = await this.docker.createContainer({
        Image: 'ubuntu',
        Cmd: ['bash'],
        name: OptimizationExecution.imageNamePrefix + 'ubuntu-test',
      });
      container.start();
    } catch (error) {
      winston.error(error);
    }
  }

  public async stopAndRemoveAll() {
    winston.info('Stopping all containers...');
    const containers = await this.docker.listContainers({ all: true });
    const containerStopStatus: Array<Promise<void>> = [];
    containers.forEach((containerInfo) => {
      if (containerInfo.Names.some((name) => name.startsWith('/' + OptimizationExecution.imageNamePrefix))) {
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