import { prop } from 'typegoose';

/**
 * @swagger
 *
 *  components:
 *    schemas:
 *      ResourceAttributeValue:
 *        type: object
 *        required:
 *          - name
 *          - value
 *        properties:
 *          name:
 *            type: string
 *          value:
 *            type: string
 */

export default class ResourceAttributeValue {
  // region public static methods
  // endregion

  // region private static methods
  // endregion

  // region public members
  @prop({ required: true })
  public name: string = '';

  @prop({ required: true })
  public value: string = '';
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
