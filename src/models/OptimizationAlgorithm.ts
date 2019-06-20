import { Typegoose, prop, arrayProp, Ref } from 'typegoose';
import { Serializer } from 'jsonapi-serializer';
import { ResourceType } from './ResourceType';

interface DockerConfiguration {
  name: string;
  tag?: string;
  digest?: string;
}

const DockerConfigurationNullObject = {
  name: '',
};

/**
 * @swagger
 *
 *  components:
 *    schemas:
 *      OptimizationAlgorithm:
 *        allOf:
 *          - $ref: '#/components/schemas/JsonApiObject'
 *          - type: object
 *            properties:
 *              attributes:
 *                type: object
 *                required:
 *                  - name
 *                  - inputs
 *                  - outputs
 *                  - dockerConfig
 *                properties:
 *                  name:
 *                    type: string
 *                  inputs:
 *                    type: array
 *                    items:
 *                      type: string
 *                  outputs:
 *                    type: string
 *                  dockerConfig:
 *                    type: object
 *                    required:
 *                      - name
 *                    properties:
 *                      name:
 *                        type: string
 *                      tag:
 *                        type: string
 *                      digest:
 *                        type: string
 */

export class OptimizationAlgorithm extends Typegoose {
  [index: string]: any;
  // region public static methods
  // endregion

  // region private static methods
  // endregion

  // region public members
  @prop({ required: true, unique: true })
  public name: string = '';

  @arrayProp({ itemsRef: ResourceType })
  public inputs: Array<Ref<ResourceType>> = [];

  @prop({ ref: ResourceType })
  public outputs!: Ref<ResourceType>;

  @prop({ required: true })
  public dockerConfig: DockerConfiguration = DockerConfigurationNullObject;
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

const OptimizationAlgorithmModel = new OptimizationAlgorithm().getModelForClass(OptimizationAlgorithm);

export default OptimizationAlgorithmModel;

export const optimizationAlgorithmSerializer = new Serializer('optimizationAlgorithm', {
  id: '_id',
  attributes: [
    'name',
    'inputs',
    'outputs',
    'dockerConfig',
  ],
  keyForAttribute: 'camelCase',
} as any);
