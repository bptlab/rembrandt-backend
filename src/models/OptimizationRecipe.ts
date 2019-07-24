import { Typegoose, prop, arrayProp, instanceMethod } from 'typegoose';
import { Serializer } from 'jsonapi-serializer';
import OptimizationIngredient, { IngredientType, Position } from './OptimizationIngredient';
import { ObjectId } from 'bson';
import { getIdFromRef } from '@/utils/utils';
import ResourceTypeModel from './ResourceType';

interface TreeRecipeStructure {
  ingredientObject: any;
  ingredientType: IngredientType;
  position: Position;
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

    ingredientDef.ingredientDefinition = ingredientStructure.ingredientObject.id;
    ingredientDef.ingredientType = ingredientStructure.ingredientType;
    ingredientDef.position = ingredientStructure.position;

    if (ingredientStructure.inputs) {
      ingredientDef.inputs = ingredientStructure.inputs.map((input) => {
        return OptimizationRecipe.addIngredientFromJSON(recipe, input) as any;
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

  @prop()
  get inputs(): string[] {
    return this.ingredients.filter((ingredient) => ingredient.ingredientType === IngredientType.INPUT)
      .map((ingredient) => ingredient.ingredientDefinition);
  }
  @prop()
  get outputs(): string[] {
    return this.ingredients.filter((ingredient) => ingredient.ingredientType === IngredientType.OUTPUT)
      .map((ingredient) => ingredient.ingredientDefinition);
  }
  // endregion

  // region private members
  // endregion

  // region constructor
  // endregion

  // region public methods
  @instanceMethod
  public async toNestedObject(ingredient: OptimizationIngredient): Promise<TreeRecipeStructure> {
    let ingredientObject;

    switch (ingredient.ingredientType) {
      case IngredientType.INPUT:
        ingredientObject = await ResourceTypeModel.findById(ingredient.ingredientDefinition).lean().exec();
        break;
      case IngredientType.OUTPUT:
        ingredientObject = await ResourceTypeModel.findById(ingredient.ingredientDefinition).lean().exec();
        break;
      default:
        ingredientObject = await OptimizationIngredient.getIngredientObject(ingredient);
        break;
    }

    const returnObject: TreeRecipeStructure = {
      ingredientObject,
      ingredientType: ingredient.ingredientType,
      position: ingredient.position,
    };

    if (ingredient.inputs.length === 0) {
      return returnObject;
    }

    const ingredientInputObjects = await Promise.all(ingredient.inputs.map((input) => {
      if (input instanceof ObjectId) {
        const inputObject = this.ingredients.find((ingredientElement) => ingredientElement.id === getIdFromRef(input));
        if (!inputObject) {
          throw new Error(`Could not find ingredient with id ${getIdFromRef(input)} in recipe ${this.name}.`);
        }
        return this.toNestedObject(inputObject);
      }
      const inputIngredient = input as OptimizationIngredient;
      return this.toNestedObject(inputIngredient);
    }));

    returnObject.inputs = ingredientInputObjects;

    return returnObject;
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
    'inputs',
    'outputs',
  ],
  keyForAttribute: 'camelCase',
} as any);
