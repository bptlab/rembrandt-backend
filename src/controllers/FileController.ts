import { promises as fs } from 'fs';
import path from 'path';
import config from '@/config.json';
import IntermediateResult from '@/models/IntermediateResult';
import ResourceTypeModel, { ResourceType } from '@/models/ResourceType';
import { Ref } from 'typegoose';
import { ResourceInstance } from '@/models/ResourceInstance';
import { getIdFromRef } from '@/utils/utils';
import { ObjectId } from 'bson';

export default class FileController {
  // region public static methods
  public static async createControllerForExecution(identifier: string): Promise<FileController> {
    const newFileController = new FileController(identifier);
    await newFileController.createDirectoryForDataExchange();
    return newFileController;
  }
  // endregion

  // region private static methods
  // endregion

  // region public members
  // endregion

  // region private members
  private filePathForDataExchange: string;
  // endregion

  // region constructor
  constructor(identifier: string) {
    this.filePathForDataExchange = path.join(path.normalize(config.docker.dataExchangeDirectory), identifier);
  }
  // endregion

  // region public methods
  public async writeRequiredAlgorithmInputFiles(
    input: IntermediateResult,
    requiredTypes: Array<Ref<ResourceType>>): Promise<void[]> {

    const fileWriters: Array<Promise<void>> = [];

    requiredTypes.forEach((algorithmInputType) => {
      const inputData = input.getResultsForResourceType(algorithmInputType);
      fileWriters.push(this.writeRequiredAlgorithmInputFile(algorithmInputType, inputData));
    });

    return Promise.all(fileWriters);
  }

  public async readProducedAlgorithmOutputFiles(requiredTypes: Ref<ResourceType>): Promise<IntermediateResult> {
    const resultJSON = await fs.readFile(path.join(this.filePathForDataExchange, 'result.txt'), 'utf8');
    const resultObjects = JSON.parse(resultJSON);

    const intermediateResult = new IntermediateResult();
    intermediateResult.addResultsForResourceType(requiredTypes, resultObjects);
    intermediateResult.finish();
    return intermediateResult;
  }
  // endregion

  // region private methods
  private async writeRequiredAlgorithmInputFile(resourceType: Ref<ResourceType>,
                                                inputData: ResourceInstance[]): Promise<void> {

    let resourceTypeName = '';
    if (resourceType instanceof ObjectId) {
      const resourceTypeObject = await ResourceTypeModel.findById(getIdFromRef(resourceType)).lean().exec();
      if (resourceTypeObject) {
        resourceTypeName = resourceTypeObject.name;
      } else {
        throw new Error(`Could not find name of input resource type with id ${getIdFromRef(resourceType)}.`);
      }
    } else {
      resourceTypeName = resourceType.name;
    }

    return fs.writeFile(path.join(this.filePathForDataExchange, `${resourceTypeName}.txt`), JSON.stringify(inputData));
  }

  private async createDirectoryForDataExchange(): Promise<any> {
    // CREATE FOLDER FOR DATA EXCHANGE
    try {
      await fs.mkdir(this.filePathForDataExchange);
    } catch (error) {
      return new Promise((resolve, reject) => {
        reject(
          // tslint:disable-next-line: max-line-length
          new Error(`Could not create directory for docker data exchange in ${config.docker.dataExchangeDirectory}. ${error}`),
        );
      });
    }
  }
  // endregion
}
