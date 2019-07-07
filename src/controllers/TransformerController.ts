import { OptimizationTransformer } from '@/models/OptimizationTransformer';
import IngredientController from '@/controllers/IngredientControllerInterface';
import { ResourceInstance } from '@/models/ResourceInstance';
import IntermediateResult from '@/models/IntermediateResult';

export default class TransformerController implements IngredientController {
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
  public async execute(input: IntermediateResult): Promise<IntermediateResult> {
    const functionBody = `return inputArray.${this.transformer.transformerType}((instance) => {
      ${this.transformer.body}});`;
    const transform = new Function('inputArray', functionBody);
    const transformedResourceInstanceList = transform(input.getResultsForResourceType(this.transformer.resourceType));

    const response = new IntermediateResult();
    response.addResultsForResourceType(this.transformer.resourceType, transformedResourceInstanceList);
    return response;
  }
  // endregion

  // region private methods
  // endregion
}
