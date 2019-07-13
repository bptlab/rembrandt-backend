import { Typegoose, prop, arrayProp, Ref, instanceMethod } from 'typegoose';
import { Serializer } from 'jsonapi-serializer';
import OptimizationIngredient from './OptimizationIngredient';
import { ObjectId } from 'bson';
import { getIdFromRef } from '@/utils/utils';

interface TreeRecipeStructure {
  ingredientObject: any;
  inputs?: TreeRecipeStructure[];
}

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

export class OptimizationRecipe extends Typegoose {
  [index: string]: any;
  // region public static methods
  public static addIngredientFromJSON(
    recipe: OptimizationRecipe, ingredientStructure: TreeRecipeStructure): ObjectId {
    const ingredientDef = new OptimizationIngredient();

    ingredientDef.ingredientDefinition = ingredientStructure.ingredientObject.definitionId;
    ingredientDef.ingredientType = ingredientStructure.ingredientObject.type;
    ingredientDef.position = ingredientStructure.ingredientObject.position;

    if (ingredientStructure.inputs) {
      ingredientDef.inputs = ingredientStructure.inputs.map((input) => {
        return OptimizationRecipe.addIngredientFromJSON(recipe, input);
      });
    }

    const ingredientIndex = recipe.ingredients.push(ingredientDef) - 1 ;
    return recipe.ingredients[ingredientIndex]._id;
  }
  // endregion

  // region private static methods
  // endregion

  // region public members
  @prop({ required: true, unique: true })
  public name!: string;

  @arrayProp({ items: OptimizationIngredient, default: [] })
  public ingredients: OptimizationIngredient[] = [];
  // endregion

  // region private members
  // endregion

  // region constructor
  // endregion

  // region public methods
  @instanceMethod
  public async toNestedObject(ingredient: OptimizationIngredient): Promise<TreeRecipeStructure> {
    const ingredientObject = await OptimizationIngredient.getIngredientObject(ingredient);
    if (ingredient.inputs.length === 0) {
      return {
        ingredientObject,
      };
    }

    const ingredientInputObjects = await Promise.all(ingredient.inputs.map((input) => {
      if (input instanceof ObjectId) {
        const inputObject = this.ingredients.find((ingredientElement) => ingredientElement.id === getIdFromRef(input));
        if (!inputObject) {
          throw new Error(`Could not find ingredient with id ${getIdFromRef(input)} in recipe ${this.name}.`);
        }
        return this.toNestedObject(inputObject);
      }
      return this.toNestedObject(input);
    }));

    return {
      ingredientObject,
      inputs: ingredientInputObjects,
    };
  }
  // endregion

  // region private methods
  // endregion

}

const OptimizationRecipeModel = new OptimizationRecipe().getModelForClass(OptimizationRecipe);

export default OptimizationRecipeModel;

export const optimizationRecipeSerializer = new Serializer('optimizationRecipe', {
  id: '_id',
  attributes: [
    'name',
    'ingredients',
  ],
  keyForAttribute: 'camelCase',
} as any);
