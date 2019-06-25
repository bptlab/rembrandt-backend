import Docker from 'dockerode';
import { OptimizationAlgorithm } from '@/models/OptimizationAlgorithm';
import config from '@/config.json';

export default class OptimizationExecution {
  // region public static methods
  // endregion

  // region private static methods
  // endregion

  // region public members
  public optimizationAlgorithm: OptimizationAlgorithm;
  // endregion

  // region private members
  private docker?: Docker;
  // endregion

  // region constructor
  constructor(optimizationAlgorithm: OptimizationAlgorithm) {
    this.optimizationAlgorithm = optimizationAlgorithm;
    this.docker = new Docker(config.docker);
    // this.initializeDockerContainer();
    console.log(this.optimizationAlgorithm.getImageIdentifier());
    this.run();
  }
  // endregion

  // region public methods
  public async run() {
    if (!this.docker) {
      return;
    }
    try {
      // Image: this.optimizationAlgorithm.getImageIdentifier(),
      const container = await this.docker.createContainer({
        Image: 'ubuntu',
        Cmd: ['bash'],
        name: 'ubuntu-test',
      });
      container.start();
    } catch (error) {
      console.log(error);
    }
  }
  // endregion

  // region private methods
  private initializeDockerContainer() {
    this.docker = new Docker({ host: '127.0.0.1', port: 3000 });
  }
  // endregion
}
