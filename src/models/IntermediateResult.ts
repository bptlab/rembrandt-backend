import { ResourceInstance } from './ResourceInstance';
import { ResourceType } from './ResourceType';
import { Ref } from 'typegoose';
import { getIdFromRef } from '@/utils/utils';
import { throws } from 'assert';

interface IntermediateResultObject {
  [index: string]: ResourceInstance[];
}

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

  public addResultsForResourceType(resourceType: Ref<ResourceType>, resultList: ResourceInstance[]) {
    if (this.finished) {
      throw new Error('Can not add results to intermediate result marked as finished.');
    }
    this.data[getIdFromRef(resourceType)] = resultList;
  }

  public getResultsForResourceType(resourceType: Ref<ResourceType>): ResourceInstance[] {
    return this.data[getIdFromRef(resourceType)];
  }
  // endregion

  // region private methods
  // endregion
}
