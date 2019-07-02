import { ResourceType } from '@/models/ResourceType';
import { Ref } from 'typegoose';

export default interface Ingredient {
  // region public static methods
  // endregion

  // region private static methods
  // endregion

  // region public members
  // endregion

  // region private members
  // endregion

  // region constructor
  // endregion

  // region public methods
  execute(input: any): any;
  returnType(): Ref<ResourceType>;
  // endregion

  // region private methods
  // endregion
}
