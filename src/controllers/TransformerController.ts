import { OptimizationTransformer } from '@/models/OptimizationTransformer';
import Ingredient from '@/controllers/IngredientInterface';
import { ResourceInstance } from '@/models/ResourceInstance';
import IntermediateResult from '@/models/IntermediateResult';

export default class TransformerController implements Ingredient {
  // region public static methods
  // endregion

  // region private static methods
  // endregion

  // region public members
  public transformer: OptimizationTransformer;
  // endregion

  // region private members
  // endregion

  // region constructor
  constructor(transformer: OptimizationTransformer) {
    this.transformer = transformer;
  }
  // endregion

  // region public methods
  public execute(input: IntermediateResult): ResourceInstance[] {
    const functionBody = `return inputArray.${this.transformer.transformerType}((instance) => {
      ${this.transformer.body}});`;
    const transform = new Function('inputArray', functionBody);
    return transform(input.getResultsForResourceType(this.transformer.resourceType));
  }
  // endregion

  // region private methods
  // endregion
}
