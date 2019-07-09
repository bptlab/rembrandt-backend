import { Typegoose, prop, arrayProp, Ref, instanceMethod } from 'typegoose';

export enum IngredientType {
  INPUT = 'input',
  OUTPUT = 'output',
  TRANSFORM = 'transform',
  ALGORITHM = 'algorithm',
}

export default class OptimizationIngredient extends Typegoose {
  [index: string]: any;
  // region public static methods
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
