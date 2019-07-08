import { OptimizationAlgorithm } from '@/models/OptimizationAlgorithm';
import winston = require('winston');
import OptimizationExecutionModel, { OptimizationExecution } from '@/models/OptimizationExecution';
import IngredientController from './IngredientControllerInterface';
import DockerController from './DockerController';
import IntermediateResult from '@/models/IntermediateResult';
import { promises as fs } from 'fs';
import path from 'path';
import config from '@/config.json';
import { ResourceInstance } from '@/models/ResourceInstance';

export default class AlgorithmController implements IngredientController {
  // region public static methods
  // endregion

  // region private static methods
  // endregion

  // region public members
  public optimizationAlgorithm: OptimizationAlgorithm;
  // endregion

  // region private members
  private dockerController: DockerController;
  private filePathForDataExchange!: string;
  // endregion

  // region constructor
  constructor(optimizationAlgorithm: OptimizationAlgorithm) {
    this.dockerController = new DockerController();
    this.optimizationAlgorithm = optimizationAlgorithm;
  }
  // endregion

  // region public methods
  public async execute(input: IntermediateResult): Promise<IntermediateResult> {
    const executionInstance = new OptimizationExecutionModel();
    executionInstance.optimizationAlgorithm = this.optimizationAlgorithm;
    await this.createDirectoryForDataExchange(executionInstance.identifier);
    this.writeRequiredAlgorithmInputFiles(input);

    try {
      await executionInstance.save();
      const containerName = executionInstance.containerName;

      await this.dockerController.run(
        this.optimizationAlgorithm.imageIdentifier,
        ['/bin/bash', '-c', 'sleep 30s'],
        process.stdout,
        { name: containerName })
        .then((container) => {
          executionInstance.terminate(container.output.StatusCode);
          winston.debug(`Container ${containerName} exited with code ${container.output.StatusCode}`);
        });

      return await this.readProducedAlgorithmOutputFiles();
    } catch (error) {
      return new Promise((resolve, reject) => {
        reject(
          new Error(`Could not start docker container for algorithm: ${this.optimizationAlgorithm.name}. ${error}`),
        );
      });
    }
  }
  public async executeAsynchronous(input: IntermediateResult): Promise<OptimizationExecution> {
    const executionInstance = new OptimizationExecutionModel();
    executionInstance.optimizationAlgorithm = this.optimizationAlgorithm;
    await this.createDirectoryForDataExchange(executionInstance.identifier);
    this.writeRequiredAlgorithmInputFiles(input);

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
          this.readProducedAlgorithmOutputFiles();
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
  private async createDirectoryForDataExchange(executionId: string): Promise<any> {
    this.filePathForDataExchange = path.join(path.normalize(config.docker.dataExchangeDirectory), executionId);

    // CREATE FOLDER FOR DATA EXCHANGE
    try {
      await fs.mkdir(this.filePathForDataExchange);
    } catch (error) {
      return new Promise((resolve, reject) => {
        reject(
          new Error(`Could not create directory for docker data exchange in ${config.docker.dataExchangeDirectory}.
            ${error}`),
        );
      });
    }

  }

  private async writeRequiredAlgorithmInputFiles(input: IntermediateResult): Promise<Array<Promise<void>>> {
    const fileWriters: Array<Promise<void>> = [];

    this.optimizationAlgorithm.inputs.forEach((algorithmInput) => {
      const inputData = input.getResultsForResourceType(algorithmInput);
      fileWriters.push(this.writeRequiredAlgorithmInputFile(inputData));
    });

    return fileWriters;
  }

  private async writeRequiredAlgorithmInputFile(inputData: ResourceInstance[]): Promise<void> {
    return fs.writeFile(path.join(this.filePathForDataExchange, 'test.txt'), JSON.stringify(inputData));
  }

  private async readProducedAlgorithmOutputFiles(): Promise<IntermediateResult> {
    return new IntermediateResult();
  }
  // endregion
}
