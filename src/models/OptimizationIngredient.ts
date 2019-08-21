import { Typegoose, prop, arrayProp, Ref } from 'typegoose';
import { ObjectId } from 'bson';
import OptimizationTransformerModel, { OptimizationTransformer } from '@/models/OptimizationTransformer';
import OptimizationAlgorithmModel, { OptimizationAlgorithm } from '@/models/OptimizationAlgorithm';
import { InputIngredient, OutputIngredient } from '@/models/Ingredient';

export enum IngredientType {
  INPUT = 'input',
  OUTPUT = 'output',
  TRANSFORM = 'transform',
  ALGORITHM = 'algorithm',
}

export interface Position {
  x: number;
  y: number;
}

export default class OptimizationIngredient extends Typegoose {
  [index: string]: any;
  // region public static methods
  public static async getIngredientObject(ingredient: OptimizationIngredient):
    Promise<OptimizationTransformer | OptimizationAlgorithm | InputIngredient | OutputIngredient> {

    switch (ingredient.ingredientType) {
      case IngredientType.INPUT:
        return {
          inputResourceType: new ObjectId(ingredient.ingredientDefinition) as any,
        };
      case IngredientType.ALGORITHM:
        const optimizationAlgorithm = await OptimizationAlgorithmModel.findById(ingredient.ingredientDefinition).exec();
        if (!optimizationAlgorithm) {
          // tslint:disable-next-line: max-line-length
          throw new Error(`Could not find optimization algorithm ${ingredient.ingredientDefinition} in recipe ${ingredient.parent().name}.`);
        }
        return optimizationAlgorithm;
      case IngredientType.TRANSFORM:
        const optimizationTransformer = await OptimizationTransformerModel
          .findById(ingredient.ingredientDefinition)
          .exec();
        if (!optimizationTransformer) {
          // tslint:disable-next-line: max-line-length
          throw new Error(`Could not find optimization transformer ${ingredient.ingredientDefinition} in recipe ${ingredient.parent().name}.`);
        }
        return optimizationTransformer;
      case IngredientType.OUTPUT:
        return {
          outputResourceType: new ObjectId(ingredient.ingredientDefinition)  as any,
        };
      default:
        // tslint:disable-next-line: max-line-length
        throw new Error(`Could not identify optimization object with id ${ingredient.ingredientDefinition} of type ${ingredient.ingredientType}.`);
    }
  }
  // endregion

  // region private static methods
  // endregion

  // region public members
  @arrayProp({ itemsRef: OptimizationIngredient })
  public inputs: Array<Ref<OptimizationIngredient>> = [];

  @prop({ required: true })
  public ingredientDefinition: string = '';

  @prop({ required: true, enum: IngredientType })
  public ingredientType!: IngredientType;

  @prop()
  public position: Position = {x: 0, y: 0};
  // endregion

  // region private members
  // endregion

  // region constructor
  // endregion

  // region public methods
  // endregion

  // region private methods
  // endregion

}

// const OptimizationIngredientModel = new OptimizationIngredient().getModelForClass(OptimizationIngredient);

// export default OptimizationIngredientModel;
