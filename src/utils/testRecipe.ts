import OptimizationTransformerModel from '@/models/OptimizationTransformer';
import RecipeController from '@/controllers/RecipeController';
import OptimizationAlgorithmModel from '@/models/OptimizationAlgorithm';
import OptimizationRecipeModel, { OptimizationRecipe } from '@/models/OptimizationRecipe';
import winston = require('winston');

const idOfResourceType = '5d14c2251b0b6d2cd4b4c52e';
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
        definitionId: idOfResourceType,
        type: 'output',
      },
      inputs: [{
        ingredientObject: {
          definitionId: algorithmDefinition.id,
          type: 'algorithm',
        },
        inputs: [{
          ingredientObject: {
            definitionId: transformerDefinition.id,
            type: 'transform',
          },
          inputs: [{
            ingredientObject: {
              definitionId: idOfResourceType,
              type: 'input',
            },
          }],
        }],
      }],
    };

    OptimizationRecipe.addIngredientFromJSON(testRecipeInstance, recipeJson);
    testRecipeInstance.name = nameOfTestRecipe;
    await testRecipeInstance.save();
    winston.debug(`New test recipe '${nameOfTestRecipe}' created and saved.`);
  }
  const recipeController = await RecipeController.createFromOptimizationIngredient(testRecipeInstance);
  winston.debug(`Start executing test recipe '${nameOfTestRecipe}'...`);
  await recipeController.execute();
  winston.debug(`Finished test recipe '${nameOfTestRecipe}'...`);
}
