import { Typegoose, prop, Ref } from 'typegoose';
import OptimizationIngredient from '@/models/OptimizationIngredient';

export default class OptimizationExecutionIngredientState extends Typegoose {
  [index: string]: any;
  // region public static methods
  // endregion

  // region private static methods
  // endregion

  // region public members
  @prop({ ref: OptimizationIngredient, required: true })
  public ingredient!: Ref<OptimizationIngredient>;

  @prop()
  public startedAt?: Date;

  @prop()
  public finishedAt?: Date;

  @prop()
  public successful?: boolean;

  @prop()
  public comment?: string;
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
