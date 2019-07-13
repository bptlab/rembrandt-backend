import { Typegoose, prop, Ref } from 'typegoose';
import nanoId from 'nanoid/generate';
import OptimizationIngredient from '@/models/OptimizationIngredient';

export default class OptimizationExecutionIngredientState extends Typegoose {
  [index: string]: any;
  // region public static methods
  // endregion

  // region private static methods
  // endregion

  // region public members
  @prop({ required: true, unique: true, default: () => nanoId('0123456789abcdefghijklmnopqrstuvwxyz', 4) })
  public identifier: string = nanoId('0123456789abcdefghijklmnopqrstuvwxyz', 4);

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
