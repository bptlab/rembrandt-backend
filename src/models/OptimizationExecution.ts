import { Typegoose, prop, Ref, instanceMethod, arrayProp } from 'typegoose';
import { Serializer } from 'jsonapi-serializer';
import nanoId from 'nanoid/generate';
import config from '@/config.json';
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
 *                  createdAt:
 *                    type: date
 *                  startedAt:
 *                    type: date
 *                  finishedAt:
 *                    type: date
 *                  containerId:
 *                    type: string
 *                  caller:
 *                    type: string
 *                  algorithm:
 *                    type: string
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

  @prop()
  public terminationCode?: number;

  @prop()
  public caller?: string = '';

  @prop({ ref: OptimizationRecipe })
  public recipe!: Ref<OptimizationRecipe>;

  @arrayProp({ items: OptimizationExecutionIngredientState })
  public processingStates!: Array<Ref<OptimizationExecutionIngredientState>>;

  @prop()
  public successful?: boolean;

  @prop()
  public result?: IntermediateResult;

  @prop()
  get containerName(): string {
    return config.docker.containerPrefix + this.identifier;
  }
  // endregion

  // region private members
  // endregion

  // region constructor
  // endregion

  // region public methods
  @instanceMethod
  public terminate(statusCode: number) {
    this.finishedAt = new Date();
    this.terminationCode = statusCode;
    this.save();
  }
  @instanceMethod
  public ingredientStarted(ingredientId: string) {
    // tslint:disable-next-line: max-line-length
    this.processingStates.find((state) => {
      if (state instanceof ObjectId) {
        throw new Error('Method \'ingredientStarted\' can only be called on populated instances.');
      }
      if (getIdFromRef(state.ingredient) === ingredientId) {
        state.startedAt = new Date();
        this.markModified('processingStates');
        return true;
      }
      return false;
    });
  }
  @instanceMethod
  public ingredientFinished(ingredientId: string, successful: boolean, comment?: string) {
    // tslint:disable-next-line: max-line-length
    this.processingStates.find((state) => {
      if (state instanceof ObjectId) {
        throw new Error('Method \'ingredientFinished\' can only be called on populated instances.');
      }
      if (getIdFromRef(state.ingredient) === ingredientId) {
        state.finishedAt = new Date();
        state.successful = successful;

        if (comment) {
          state.comment = comment;
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
    'terminationCode',
    'caller',
    'algorithm',
  ],
  keyForAttribute: 'camelCase',
} as any);
