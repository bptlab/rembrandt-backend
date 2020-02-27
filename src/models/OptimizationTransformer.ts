import { Typegoose, prop, Ref } from 'typegoose';
import { Serializer } from 'jsonapi-serializer';
import { ResourceType } from './ResourceType';

export enum TransformerType {
  MAP = 'map',
  FILTER = 'filter',
  REDUCE = 'reduce',
}

/**
 * @swagger
 *
 *  components:
 *    schemas:
 *      OptimizationTransformer:
 *        allOf:
 *          - $ref: '#/components/schemas/JsonApiObject'
 *          - type: object
 *            properties:
 *              attributes:
 *                type: object
 *                required:
 *                  - name
 *                  - resourceType
 *                  - transformerType
 *                  - body
 *                properties:
 *                  name:
 *                    type: string
 *                  resourceType:
 *                    type: string
 *                  transformerType:
 *                    type: string
 *                    enum: [map, filter, reduce]
 *                  body:
 *                    type: string
 */

export class OptimizationTransformer extends Typegoose {
  [index: string]: any;
  // region public static methods
  // endregion

  // region private static methods
  // endregion

  // region public members
  @prop({ required: true, unique: true })
  public name: string = '';

  @prop({ required: true, ref: ResourceType })
  public resourceType!: Ref<ResourceType>;

  @prop({ required: true, enum: TransformerType })
  public transformerType!: TransformerType;

  @prop({ required: true })
  public body!: string;
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

const OptimizationTransformerModel = new OptimizationTransformer().getModelForClass(OptimizationTransformer);

export default OptimizationTransformerModel;

export const optimizationTransformerSerializer = new Serializer('OptimizationTransformer', {
  id: '_id',
  attributes: [
    'name',
    'resourceType',
    'transformerType',
    'body',
  ],
  resourceType: {
    ref: '_id',
    type: 'resourceType',
    attributes: [
      'name',
      'abstract',
      'attributes',
      'parentType',
      'eponymousAttribute',
      'costAttribute',
    ],
  },
  keyForAttribute: 'camelCase',
} as any);
