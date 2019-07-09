import { ObjectID } from 'bson';
import Ingredient, { InputIngredient } from '@/models/Ingredient';
import OptimizationTransformerModel from '@/models/OptimizationTransformer';
import RecipeController from '@/controllers/RecipeController';
import InputController from '@/controllers/InputController';
import IntermediateResult from '@/models/IntermediateResult';

const IdOfResourceType = '5d14c2251b0b6d2cd4b4c52e';

export async function testRecipe() {
  const inputDefinition: InputIngredient = {
    inputResourceType: new ObjectID(IdOfResourceType),
  };

  const transformerDefinition = await OptimizationTransformerModel.findOne({ resourceType: IdOfResourceType }).exec();
  if (!transformerDefinition) {
    throw new Error(`Could not find a transformer definition for resource type ${IdOfResourceType}`);
  }

  const inputIngr = new Ingredient(inputDefinition);
  const transformerIngr = new Ingredient(transformerDefinition);

  if (!(transformerIngr.inputs instanceof IntermediateResult)) {
    transformerIngr.inputs.push(inputIngr);
  }

  const recipe = new RecipeController([inputIngr, transformerIngr]);

  await recipe.execute();

}
