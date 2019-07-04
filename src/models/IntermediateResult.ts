import { ResourceInstance } from './ResourceInstance';
import { ResourceType } from './ResourceType';
import { Ref } from 'typegoose';
import { getIdFromRef } from '@/utils/utils';

interface IntermediateResultObject {
  [index: string]: ResourceInstance[];
}

export default class IntermediateResult {
  // region public static methods
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
  constructor(results?: IntermediateResultObject) {
    if (results) {
      this.data = results;
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
    this.data[getIdFromRef(resourceType)] = resultList;
  }

  public getResultsForResourceType(resourceType: Ref<ResourceType>): ResourceInstance[] {
    return this.data[getIdFromRef(resourceType)];
  }
  // endregion

  // region private methods
  // endregion
}
