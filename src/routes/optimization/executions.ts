import express from 'express';
import OptimizationExecutionModel, { optimizationExecutionSerializer } from '@/models/OptimizationExecution';
import winston from 'winston';
import apiSerializer from '@/utils/apiSerializer';
import createJSONError from '@/utils/errorSerializer';
import ResourceInstanceModel, { resourceInstanceSerializer } from '@/models/ResourceInstance';
import IntermediateResult from '@/models/IntermediateResult';
import { ObjectId } from 'bson';
import { populateResourceTypeOptions } from '../organization/resourceInstances';

const router: express.Router = express.Router();

export const populateRecipeOptions = {
  path: 'recipe',
  model: 'OptimizationRecipe',
};

/**
 * @swagger
 *
 *  /optimization/executions:
 *    get:
 *      summary: Get list of all optimization executions
 *      tags:
 *        - OptimizationExecution
 *      responses:
 *        '200':
 *          description: Successful
 *          content:
 *            application/vnd.api+json:
 *              schema:
 *                $ref: '#/components/schemas/OptimizationAlgorithmsResponse'
 */
router.get('/', async (req: express.Request, res: express.Response) => {
  try {
    const optimizationExecutions = await OptimizationExecutionModel
      .find({})
      .populate(populateRecipeOptions)
      .exec();
    res.send(apiSerializer(optimizationExecutions, optimizationExecutionSerializer));
  } catch (error) {
    winston.error(error.message);
    res.status(500).send(createJSONError('500', 'Error in OptimizationExecution-Router', error.message));
  }
});

/**
 * @swagger
 *
 *  /optimization/executions/{id}:
 *    get:
 *      summary: Get a optimization execution by ID
 *      tags:
 *        - OptimizationExecution
 *      parameters:
 *        - name: id
 *          in: path
 *          description: Optimization Algorithm ID
 *          required: true
 *          schema:
 *            type: string
 *      responses:
 *        '200':
 *          description: Successful
 *          content:
 *            application/vnd.api+json:
 *              schema:
 *                $ref: '#/components/schemas/OptimizationAlgorithmResponse'
 */
router.get('/:executionId', async (req: express.Request, res: express.Response) => {
  try {
    const optimizationExecution = await OptimizationExecutionModel
      .findById(req.params.executionId)
      .populate(populateRecipeOptions)
      .exec();
    if (!optimizationExecution) {
      throw Error(`Optimization execution with id ${req.params.executionId} could not be found.`);
    }
    res.send(apiSerializer(optimizationExecution, optimizationExecutionSerializer));
  } catch (error) {
    winston.error(error.message);
    res.status(500).send(createJSONError('500', 'Error in OptimizationExecution-Router', error.message));
  }
});

router.get('/:executionId/instances', async (req: express.Request, res: express.Response) => {
  try {
    const optimizationExecution = await OptimizationExecutionModel.findById(req.params.executionId).exec();
    if (!optimizationExecution) {
      throw Error(`Optimization execution with id ${req.params.executionId} could not be found.`);
    }
    if (!optimizationExecution.finishedAt) {
      throw Error(`Optimization execution with id ${req.params.executionId} is still running.`);
    }
    if ((!optimizationExecution.successful) || (!optimizationExecution.result)) {
      throw Error(`Optimization execution with id ${req.params.executionId} failed.`);
    }
    const resultObject = new IntermediateResult(optimizationExecution.result.data);
    const instancesIds: ObjectId[] = resultObject.getInstanceIdsForAllResourceTypes();

    const resourceInstances = await ResourceInstanceModel
      .find({_id: { $in: instancesIds}})
      .populate(populateResourceTypeOptions)
      .exec();
    res.send(apiSerializer(resourceInstances, resourceInstanceSerializer));
  } catch (error) {
    winston.error(error.message);
    res.status(500).send(createJSONError('500', 'Error in OptimizationExecution-Router', error.message));
  }
});


/**
 * @swagger
 *
 *  /optimization/executions/{id}:
 *    delete:
 *      summary: Delete a optimization execution with a given ID
 *      tags:
 *        - OptimizationRecipe
 *      parameters:
 *        - name: id
 *          in: path
 *          description: Optimization Execution ID
 *          required: true
 *          schema:
 *            type: string
 *      responses:
 *        '204':
 *          description: Successfully deleted
 */
router.delete('/:executionId', async (req: express.Request, res: express.Response) => {
  try {
    const optimizationExecution = await OptimizationExecutionModel.findById(req.params.executionId).exec();
    if (!optimizationExecution) {
      throw Error(`Optimization execution with Id: '${req.params.executionId}' not found. Could not be deleted.`);
    }
    await optimizationExecution.remove();
    res.status(204).send();
  } catch (error) {
    winston.error(error.message);
    res.status(500).send(createJSONError('500', 'Error in OptimizationExecution-Router', error.message));
  }
});

export default router;
