import { Typegoose, prop, Ref, instanceMethod, arrayProp } from 'typegoose';
import { Serializer } from 'jsonapi-serializer';
import nanoId from 'nanoid/generate';
import { OptimizationRecipe } from './OptimizationRecipe';
import IntermediateResult from './IntermediateResult';
import OptimizationExecutionIngredientState from './OptimizationExecutionIngredientState';
import { ObjectId } from 'bson';
import { getIdFromRef } from '@/utils/utils';

/**
 * @swagger
 *
 *  components:
 *    schemas:
 *      OptimizationExecution:
 *        allOf:
 *          - $ref: '#/components/schemas/JsonApiObject'
 *          - type: object
 *            properties:
 *              attributes:
 *                type: object
 *                required:
 *                  - identifier
 *                properties:
 *                  identifier:
 *                    type: string
 *                  startedAt:
 *                    type: integer
 *                  finishedAt:
 *                    type: integer
 *                  recipe:
 *                    type: string
 *                  processingStates:
 *                    type: object
 *                  successful:
 *                    type: boolean
 *                  result:
 *                    type: object
 */

export class OptimizationExecution extends Typegoose {
  [index: string]: any;
  // region public static methods
  // endregion

  // region private static methods
  // endregion

  // region public members
  @prop({ required: true, unique: true, default: () => nanoId('0123456789abcdefghijklmnopqrstuvwxyz', 8) })
  public identifier: string = nanoId('0123456789abcdefghijklmnopqrstuvwxyz', 8);

  @prop({ default: () => new Date()})
  public startedAt?: Date = new Date();

  @prop()
  public finishedAt?: Date;

  @prop({ ref: OptimizationRecipe })
  public recipe!: Ref<OptimizationRecipe>;

  @arrayProp({ items: OptimizationExecutionIngredientState })
  public processingStates!: Array<Ref<OptimizationExecutionIngredientState>>;

  @prop()
  public successful?: boolean;

  @prop()
  public result?: IntermediateResult;
  // endregion

  // region private members
  // endregion

  // region constructor
  // endregion

  // region public methods
  @instanceMethod
  public ingredientStarted(ingredientId: string): string {
    const state = this.processingStates.find((currentState) => {
      if (currentState instanceof ObjectId) {
        throw new Error('Method \'ingredientStarted\' can only be called on populated instances.');
      }
      const currentStateObject = currentState as OptimizationExecutionIngredientState;
      if (getIdFromRef(currentStateObject.ingredient) === ingredientId) {
        currentStateObject.startedAt = new Date();
        this.markModified('processingStates');
        return true;
      }
      return false;
    });
    if (!state) {
      throw new Error(`Could not find state for ingredient ${ingredientId} in recipe execution ${this.identifier}!`);
    }
    return (state as OptimizationExecutionIngredientState).identifier;
  }

  @instanceMethod
  public ingredientFinished(ingredientId: string, successful: boolean, comment?: string) {
    this.processingStates.find((state) => {
      if (state instanceof ObjectId) {
        throw new Error('Method \'ingredientFinished\' can only be called on populated instances.');
      }
      const stateObject = state as OptimizationExecutionIngredientState;
      if (getIdFromRef(stateObject.ingredient) === ingredientId) {
        stateObject.finishedAt = new Date();
        stateObject.successful = successful;

        if (comment) {
          stateObject.comment = comment;
        }

        this.markModified('processingStates');
        return true;
      }
      return false;
    });
  }
  // endregion

  // region private methods
  // endregion

}

const OptimizationExecutionModel = new OptimizationExecution().getModelForClass(OptimizationExecution);

export default OptimizationExecutionModel;

export const optimizationExecutionSerializer = new Serializer('optimizationExecution', {
  id: '_id',
  attributes: [
    'identifier',
    'startedAt',
    'finishedAt',
    'recipe',
    'processingStates',
    'successful',
    'result',
  ],
  recipe: {
    ref: '_id',
    type: 'optimizationRecipe',
    attributes: [
      'name',
      'ingredients',
    ],
  },
  keyForAttribute: 'camelCase',
} as any);
