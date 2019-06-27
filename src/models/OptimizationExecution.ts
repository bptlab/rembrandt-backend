import { Typegoose, prop, Ref } from 'typegoose';
import { Serializer } from 'jsonapi-serializer';
import { OptimizationAlgorithm } from '@/models/OptimizationAlgorithm';
import nanoId from 'nanoid/generate';

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

  @prop({ ref: OptimizationAlgorithm })
  public algorithm!: Ref<OptimizationAlgorithm>;
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
