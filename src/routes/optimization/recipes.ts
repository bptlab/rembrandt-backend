import express from 'express';
import OptimizationRecipeModel, { optimizationRecipeSerializer, OptimizationRecipe } from '@/models/OptimizationRecipe';
import winston from 'winston';
import { Deserializer } from 'jsonapi-serializer';
import apiSerializer from '@/utils/apiSerializer';
import createJSONError from '@/utils/errorSerializer';
import RecipeController from '@/controllers/RecipeController';
import { optimizationExecutionSerializer } from '@/models/OptimizationExecution';

const router: express.Router = express.Router();

/**
 * @swagger
 *
 *  /optimization/recipes:
 *    get:
 *      summary: Get list of all optimization recipes
 *      tags:
 *        - OptimizationRecipe
 *      responses:
 *        '200':
 *          description: Successful
 *          content:
 *            application/vnd.api+json:
 *              schema:
 *                $ref: '#/components/schemas/OptimizationRecipesResponse'
 */
router.get('/', async (req: express.Request, res: express.Response) => {
  try {
    const optimizationRecipes = await OptimizationRecipeModel
      .find({})
      .exec();
    res.send(apiSerializer(optimizationRecipes, optimizationRecipeSerializer));
  } catch (error) {
    winston.error(error.message);
    res.status(500).send(createJSONError('500', 'Error in OptimizationRecipe-Router', error.message));
  }
});

/**
 * @swagger
 *
 *  /optimization/recipes/{id}:
 *    get:
 *      summary: Get a optimization recipe by ID
 *      tags:
 *        - OptimizationRecipe
 *      parameters:
 *        - name: id
 *          in: path
 *          description: Optimization Recipe ID
 *          required: true
 *          schema:
 *            type: string
 *      responses:
 *        '200':
 *          description: Successful
 *          content:
 *            application/vnd.api+json:
 *              schema:
 *                $ref: '#/components/schemas/OptimizationRecipeResponse'
 */
router.get('/:recipeId', async (req: express.Request, res: express.Response) => {
  try {
    const optimizationRecipe = await OptimizationRecipeModel
      .findById(req.params.recipeId)
      .exec();
    if (!optimizationRecipe) {
      throw Error(`Optimization recipe with id ${req.params.recipeId} could not be found.`);
    }
    const amountOfIngredients = optimizationRecipe.ingredients.length;
    const outputIngredient = optimizationRecipe.ingredients[amountOfIngredients - 1];
    res.send({
      rootIngredient: await optimizationRecipe.toNestedObject(outputIngredient),
      name: optimizationRecipe.name,
    });
    } catch (error) {
    winston.error(error.message);
    res.status(500).send(createJSONError('500', 'Error in OptimizationRecipe-Router', error.message));
  }
});

router.get('/:recipeId/execute', async (req: express.Request, res: express.Response) => {
  try {
    const optimizationRecipe = await OptimizationRecipeModel
      .findById(req.params.recipeId)
      .exec();
    if (!optimizationRecipe) {
      throw Error(`Optimization recipe with id ${req.params.recipeId} could not be found.`);
    }
    const recipeController = await RecipeController.createFromOptimizationIngredient(optimizationRecipe);
    recipeController.execute();
    res.send(apiSerializer(recipeController.execution, optimizationExecutionSerializer));
  } catch (error) {
    winston.error(error.message);
    res.status(500).send(createJSONError('500', 'Error in OptimizationRecipe-Router', error.message));
  }
});

/**
 * @swagger
 *
 *  /optimization/recipes:
 *    post:
 *      summary: Create a new optimization recipe
 *      tags:
 *        - OptimizationRecipe
 *      responses:
 *        '201':
 *          description: Successful
 *          content:
 *            application/vnd.api+json:
 *              schema:
 *                $ref: '#/components/schemas/OptimizationRecipeResponse'
 */
router.post('/', async (req: express.Request, res: express.Response) => {
  try {
    const newOpAlJSON = await new Deserializer({ keyForAttribute: 'camelCase' }).deserialize(req.body);
    const newOpAl = new OptimizationRecipeModel();
    newOpAl.name = newOpAlJSON.name;
    OptimizationRecipe.addIngredientFromJSON(newOpAl, newOpAlJSON.rootIngredient);
    await newOpAl.save();
    res.status(201).send(apiSerializer(newOpAl, optimizationRecipeSerializer));
  } catch (error) {
    winston.error(error.message);
    res.status(500).send(createJSONError('500', 'Error in OptimizationRecipe-Router', error.message));
  }
});

/**
 * @swagger
 *
 *  /optimization/recipes/{id}:
 *    patch:
 *      summary: Update a optimization recipe with a given ID
 *      tags:
 *        - OptimizationRecipe
 *      parameters:
 *        - name: id
 *          in: path
 *          description: Optimization Recipe ID
 *          required: true
 *          schema:
 *            type: string
 *      responses:
 *        '204':
 *          description: Successfully updated
 */
router.patch('/:recipeId', async (req: express.Request, res: express.Response) => {
  try {
    const newSettings = await new Deserializer({ keyForAttribute: 'camelCase' }).deserialize(req.body);
    if (req.params.recipeId !== newSettings.id) {
      throw Error('ObjectId provided in body does not match id in url. Denying update.');
    }

    const optimizationRecipe = await OptimizationRecipeModel.findById(req.params.recipeId).exec();
    if (!optimizationRecipe) {
      throw Error(`Optimization recipe with id ${req.params.recipeId} could not be found.`);
    }
    optimizationRecipe.set({
      name: newSettings.name,
      dockerConfig: newSettings.dockerConfig,
    });
    await optimizationRecipe.save();
    res.status(204).send();
  } catch (error) {
    winston.error(error.message);
    res.status(500).send(createJSONError('500', 'Error in OptimizationRecipe-Router', error.message));
  }
});

/**
 * @swagger
 *
 *  /optimization/recipes/{id}:
 *    delete:
 *      summary: Delete a optimization recipe with a given ID
 *      tags:
 *        - OptimizationRecipe
 *      parameters:
 *        - name: id
 *          in: path
 *          description: Optimization Recipe ID
 *          required: true
 *          schema:
 *            type: string
 *      responses:
 *        '204':
 *          description: Successfully deleted
 */
router.delete('/:recipeId', async (req: express.Request, res: express.Response) => {
  try {
    const optimizationRecipe = await OptimizationRecipeModel.findById(req.params.recipeId).exec();
    if (!optimizationRecipe) {
      throw Error(`Optimization recipe with Id: '${req.params.recipeId}' not found. Could not be deleted.`);
    }
    await optimizationRecipe.remove();
    res.status(204).send();
  } catch (error) {
    winston.error(error.message);
    res.status(500).send(createJSONError('500', 'Error in OptimizationRecipe-Router', error.message));
  }
});

export default router;
