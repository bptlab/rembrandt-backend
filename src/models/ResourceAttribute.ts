import { prop } from 'typegoose';

/**
 * @swagger
 *
 *  components:
 *    schemas:
 *      ResourceAttribute:
 *        type: object
 *        required:
 *          - name
 *          - dataType
 *          - required
 *        properties:
 *          id:
 *            type: string
 *          name:
 *            type: string
 *          dataType:
 *            type: string
 *          required:
 *            type: boolean
 */

export default class ResourceAttribute {
  // region public static methods
  // endregion

  // region private static methods
  // endregion

  // region public members
  @prop({ required: true })
  public name: string = '';

  @prop({ required: true })
  public dataType: string = '';

  @prop({ required: true })
  public required: boolean = false;
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
