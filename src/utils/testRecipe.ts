import OptimizationTransformerModel from '@/models/OptimizationTransformer';
import RecipeController from '@/controllers/RecipeController';
import OptimizationAlgorithmModel from '@/models/OptimizationAlgorithm';
import OptimizationRecipeModel, { OptimizationRecipe } from '@/models/OptimizationRecipe';
import winston = require('winston');
import { IngredientType } from '@/models/OptimizationIngredient';

const idOfResourceType = '5d14c2251b0b6d2cd4b4c52e';
const idOfResourceType2 = '5d14c2251b0b6d2cd4b4c532';
const nameOfTestRecipe = 'Testrecipe';

export async function testRecipe() {
  let testRecipeInstance = await OptimizationRecipeModel.findOne({ name: nameOfTestRecipe }).exec();

  if (testRecipeInstance) {
    winston.debug('You already have a test recipe in your database.');
  } else {
    winston.debug('Creating a new test recipe in your database.');

    const transformerDefinition = await OptimizationTransformerModel.findOne({ resourceType: idOfResourceType }).exec();
    if (!transformerDefinition) {
      throw new Error(`Could not find a transformer definition for resource type ${idOfResourceType}`);
    }

    const algorithmDefinition = await OptimizationAlgorithmModel.findOne({ outputs: idOfResourceType }).exec();
    if (!algorithmDefinition) {
      throw new Error(`Could not find a algorithm definition for resource type ${idOfResourceType}`);
    }

    testRecipeInstance = new OptimizationRecipeModel();

    const recipeJson = {
      ingredientObject: {
        id: idOfResourceType,
      },
      ingredientType: IngredientType.OUTPUT,
      position: {x: 0, y: 0},
      inputs: [{
        ingredientObject: {
          id: algorithmDefinition.id,
        },
        ingredientType: IngredientType.ALGORITHM,
        position: { x: 0, y: 0 },
        inputs: [{
          ingredientObject: {
            id: transformerDefinition.id,
          },
          ingredientType: IngredientType.TRANSFORM,
          position: { x: 0, y: 0 },
          inputs: [{
            ingredientObject: {
              id: idOfResourceType,
            },
            ingredientType: IngredientType.INPUT,
            position: { x: 0, y: 0 },
          }],
        },
        {
          ingredientObject: {
            id: idOfResourceType2,
          },
          ingredientType: IngredientType.INPUT,
          position: { x: 0, y: 0 },
        }],
      }],
    };

    OptimizationRecipe.addIngredientFromJSON(testRecipeInstance, recipeJson);
    testRecipeInstance.name = nameOfTestRecipe;
    await testRecipeInstance.save();
    winston.debug(`New test recipe '${nameOfTestRecipe}' created and saved.`);
  }
  const recipeController = await RecipeController.createFromOptimizationIngredient(testRecipeInstance);
  await recipeController.execute();
}
