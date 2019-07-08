import IntermediateResult from '@/models/IntermediateResult';
import { OptimizationExecution } from '@/models/OptimizationExecution';

export default interface IngredientController {
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
  execute(input: IntermediateResult): Promise<IntermediateResult>;
  // endregion

  // region private methods
  // endregion
}
