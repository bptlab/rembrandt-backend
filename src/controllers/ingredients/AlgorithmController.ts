import { OptimizationAlgorithm } from '@/models/OptimizationAlgorithm';
import winston = require('winston');
import IngredientController from './IngredientControllerInterface';
import DockerController from '../DockerController';
import IntermediateResult from '@/models/IntermediateResult';
import config from '@/config.json';
import FileController from '../FileController';
import path, { resolve } from 'path';


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
  // endregion

  // region constructor
  constructor(optimizationAlgorithm: OptimizationAlgorithm) {
    this.dockerController = new DockerController();
    this.optimizationAlgorithm = optimizationAlgorithm;
  }
  // endregion

  // region public methods
  public async execute(input: IntermediateResult, identifier: string): Promise<IntermediateResult> {
    const fileController = await FileController.createControllerForExecution(identifier);

    try {
      await fileController.writeRequiredAlgorithmInputFiles(input, this.optimizationAlgorithm.inputs);
    } catch (error) {
      throw new Error(`Error while creating input files for algorithm. ${error}`);
    }

    try {
      const containerName = config.docker.containerPrefix + identifier;
      winston.debug(path.normalize(config.docker.dataExchangeDirectory));
      await this.dockerController.run(
        this.optimizationAlgorithm.imageIdentifier,
        [],
        process.stdout,
        {
          name: containerName,
          env: [`folderPath=/mnt/rembrandt/${identifier}/`],
          HostConfig: {
            Binds: [`D:\\Uni\\Master\\MA\\Rembrandt\\rembrandt-backend\\dataExchange\\:/mnt/rembrandt:rw`],
            //Binds: ['rembrandt_data-exchange:/mnt/rembrandt:rw'],
          },
        })
        .then((container) => {
          winston.debug(`Container ${containerName} exited with code ${container.output.StatusCode}.`);
        });

      const algorithmResult = await fileController.readProducedAlgorithmOutputFiles(this.optimizationAlgorithm.outputs);
      fileController.removeDirectoryForDataExchange();
      return algorithmResult;

    } catch (error) {
      fileController.removeDirectoryForDataExchange();
      throw new Error(`Error while executing container for algorithm: ${this.optimizationAlgorithm.name}. ${error}`);
    }
  }
  // endregion

  // region private methods
  // endregion
}
