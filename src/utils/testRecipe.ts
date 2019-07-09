import { ObjectID } from 'bson';
import Ingredient, { InputIngredient, OutputIngredient } from '@/models/Ingredient';
import OptimizationTransformerModel from '@/models/OptimizationTransformer';
import RecipeController from '@/controllers/RecipeController';

const IdOfResourceType = '5d14c2251b0b6d2cd4b4c52e';

export async function testRecipe() {
  const inputDefinition: InputIngredient = {
    inputResourceType: new ObjectID(IdOfResourceType),
  };

  const transformerDefinition = await OptimizationTransformerModel.findOne({ resourceType: IdOfResourceType }).exec();
  if (!transformerDefinition) {
    throw new Error(`Could not find a transformer definition for resource type ${IdOfResourceType}`);
  }

  const outputDefinition: OutputIngredient = {
    outputResourceType: new ObjectID(IdOfResourceType),
  };

  const inputIngr = new Ingredient(inputDefinition);
  const transformerIngr = new Ingredient(transformerDefinition);
  const outputIngr = new Ingredient(outputDefinition);

  inputIngr.outputs.push(transformerIngr);
  (transformerIngr.inputs as Ingredient[]).push(inputIngr);
  transformerIngr.outputs.push(outputIngr);
  (outputIngr.inputs as Ingredient[]).push(transformerIngr);

  const recipe = new RecipeController([inputIngr, transformerIngr, outputIngr]);

  await recipe.execute();

}
