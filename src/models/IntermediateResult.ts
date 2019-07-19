import { ResourceInstance } from './ResourceInstance';
import { ResourceType } from './ResourceType';
import { Ref } from 'typegoose';
import { getIdFromRef } from '@/utils/utils';
import { ObjectId } from 'bson';

interface IntermediateResultObject {
  [index: string]: ResourceInstance[];
}

/**
 * @swagger
 *
 *  components:
 *    schemas:
 *      IntermediateResult:
 *        allOf:
 *          - $ref: '#/components/schemas/JsonApiObject'
 *          - type: object
 *            properties:
 *              attributes:
 *                type: object
 *                required:
 *                  - data
 *                  - finished
 *                  - error
 *                properties:
 *                  data:
 *                    type: object
 *                  finished:
 *                    type: boolean
 *                  error:
 *                    type: string
 */

export default class IntermediateResult {
  // region public static methods
  public static merge(ir1: IntermediateResult, ir2: IntermediateResult): IntermediateResult {
    if ((!ir1.finished) || (!ir2.finished)) {
      throw new Error('Can not merge unfinished intermediate results.');
    }
    const mergedResult = new IntermediateResult(ir1.data);
    Object.keys(ir2.data).forEach((key) => {
      if (key in ir1.data) {
        mergedResult.data[key] = ir1.data[key].concat(ir2.data[key]);
      } else {
        mergedResult.data[key] = ir2.data[key];
      }
    });
    mergedResult.finish();
    return mergedResult;
  }
  // endregion

  // region private static methods
  // endregion

  // region public members
  public data: IntermediateResultObject = {};
  // endregion

  // region private members
  private finished: boolean = false;
  private error: string | undefined = undefined;
  // endregion

  // region constructor
  constructor(results?: IntermediateResultObject, finished = false) {
    if (results) {
      this.data = results;
      this.finished = finished;
    }
  }
  // endregion

  // region public methods
  get isFinished(): boolean {
    return this.finished;
  }

  public finish() {
    this.finished = true;
  }

  get erroneous(): boolean {
    if (this.error) {
      return true;
    }
    return false;
  }

  public getError(): string {
    if (this.error) {
      return this.error;
    }
    return '';
  }

  public setError(errorMessage: string) {
    this.error = errorMessage;
  }

  public addResultsForResourceType(resourceType: Ref<ResourceType>, resultList: ResourceInstance[]) {
    if (this.finished) {
      throw new Error('Can not add results to intermediate result marked as finished.');
    }
    this.data[getIdFromRef(resourceType)] = resultList;
  }

  public getResultsForResourceType(resourceType: Ref<ResourceType>): ResourceInstance[] {
    return this.data[getIdFromRef(resourceType)];
  }

  public getResultsForAllResourceTypes(): ResourceInstance[] {
    const instances: ResourceInstance[] = [];
    Object.values(this.data).forEach((instancesOfType) => {
      instances.push(...instancesOfType);
    });

    return instances;
  }

  public getInstanceIdsForAllResourceTypes(): ObjectId[] {
    const instances: ObjectId[] = [];
    Object.values(this.data).forEach((instancesOfType) => {
      instancesOfType.forEach((instance) => instances.push(instance._id));
    });

    return instances;
  }

  public getIncludedResourceTypeIds(): string[] {
    return Object.keys(this.data);
  }
  // endregion

  // region private methods
  // endregion
}
