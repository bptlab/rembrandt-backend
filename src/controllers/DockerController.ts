import Docker from 'dockerode';
import config from '@/config.json';
import winston = require('winston');
import { OptimizationExecution } from '@/models/OptimizationExecution';

export default class DockerController {
  // region public static methods
  // endregion

  // region private static methods
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
  public run(image: string, command: string[],
             outputStream: NodeJS.WritableStream | NodeJS.WritableStream[], createOptions: {}): Promise<any> {
    return this.docker.run(image, command, outputStream, createOptions);
  }

  public stopExecution(executionInstance: OptimizationExecution) {
    const containerName = executionInstance.containerName;
    winston.debug(`Stopping ${containerName}`);
    const container = this.docker.getContainer(containerName);
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
