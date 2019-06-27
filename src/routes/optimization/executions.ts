import express from 'express';
import OptimizationExecutionModel, { optimizationExecutionSerializer } from '@/models/OptimizationExecution';
import winston from 'winston';
import { Deserializer } from 'jsonapi-serializer';
import apiSerializer from '@/utils/apiSerializer';
import createJSONError from '@/utils/errorSerializer';
import OptimizationManager from '@/controllers/OptimizationManager';

const router: express.Router = express.Router();

/**
 * @swagger
 *
 *  /optimization/algorithms:
 *    get:
 *      summary: Get list of all optimization algorithms
 *      tags:
 *        - OptimizationAlgorithm
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
    const optimizationExecutions = await OptimizationExecutionModel.find({}).exec();
    res.send(apiSerializer(optimizationExecutions, optimizationExecutionSerializer));
  } catch (error) {
    winston.error(error.message);
    res.status(500).send(createJSONError('500', 'Error in OptimizationAlgorithm-Router', error.message));
  }
});

/**
 * @swagger
 *
 *  /optimization/algorithms/{id}:
 *    get:
 *      summary: Get a optimization algorithm by ID
 *      tags:
 *        - OptimizationAlgorithm
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
    const optimizationExecution = await OptimizationExecutionModel.findById(req.params.executionId).exec();
    if (!optimizationExecution) {
      throw Error(`Optimization execution with id ${req.params.executionId} could not be found.`);
    }
    res.send(apiSerializer(optimizationExecution, optimizationExecutionSerializer));
  } catch (error) {
    winston.error(error.message);
    res.status(500).send(createJSONError('500', 'Error in OptimizationAlgorithm-Router', error.message));
  }
});

router.get('/:executionId/stop', async (req: express.Request, res: express.Response) => {
  try {
    const optimizationExecution = await OptimizationExecutionModel.findById(req.params.executionId).exec();
    if (!optimizationExecution) {
      throw Error(`Optimization execution with id ${req.params.executionId} could not be found.`);
    }
    const optimizationManager = new OptimizationManager();
    optimizationManager.stopExecution(optimizationExecution);
    res.status(201).send();
  } catch (error) {
    winston.error(error.message);
    res.status(500).send(createJSONError('500', 'Error in OptimizationAlgorithm-Router', error.message));
  }
});

export default router;
