import express from 'express';
import OptimizationAlgorithmModel, { optimizationAlgorithmSerializer } from '@/models/OptimizationAlgorithm';
import winston from 'winston';
import { Deserializer } from 'jsonapi-serializer';
import apiSerializer from '@/utils/apiSerializer';
import createJSONError from '@/utils/errorSerializer';
import OptimizationExecution from '@/controllers/docker';

const router: express.Router = express.Router();

const populateResourceTypeInputsOptions = {
  path: 'inputs',
  model: 'ResourceType',
};
const populateResourceTypeOutputsOptions = {
  path: 'outputs',
  model: 'ResourceType',
};

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
    const optimizationAlgorithms = await OptimizationAlgorithmModel
      .find({})
      .populate(populateResourceTypeInputsOptions)
      .populate(populateResourceTypeOutputsOptions)
      .exec();
    res.send(apiSerializer(optimizationAlgorithms, optimizationAlgorithmSerializer));
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
router.get('/:algorithmId', async (req: express.Request, res: express.Response) => {
  try {
    const optimizationAlgorithm = await OptimizationAlgorithmModel
      .findById(req.params.algorithmId)
      .populate(populateResourceTypeInputsOptions)
      .populate(populateResourceTypeOutputsOptions)
      .exec();
    if (!optimizationAlgorithm) {
      throw Error(`Optimization algorithm with id ${req.params.algorithmId} could not be found.`);
    }
    const optimizationExecution = new OptimizationExecution();
    optimizationExecution.run(optimizationAlgorithm);
    res.send(apiSerializer(optimizationAlgorithm, optimizationAlgorithmSerializer));
  } catch (error) {
    winston.error(error.message);
    res.status(500).send(createJSONError('500', 'Error in OptimizationAlgorithm-Router', error.message));
  }
});

/**
 * @swagger
 *
 *  /optimization/algorithms:
 *    post:
 *      summary: Create a new optimization algorithm
 *      tags:
 *        - OptimizationAlgorithm
 *      responses:
 *        '201':
 *          description: Successful
 *          content:
 *            application/vnd.api+json:
 *              schema:
 *                $ref: '#/components/schemas/OptimizationAlgorithmResponse'
 */
router.post('/', async (req: express.Request, res: express.Response) => {
  try {
    const newOpAlJSON = await new Deserializer({ keyForAttribute: 'camelCase' }).deserialize(req.body);
    newOpAlJSON.inputs = newOpAlJSON.inputs.map((input: any) => input.id ? input.id : input);
    if (newOpAlJSON.outputs.id) {
      newOpAlJSON.outputs = newOpAlJSON.outputs.id;
    }
    const newOpAl = new OptimizationAlgorithmModel(newOpAlJSON);
    await newOpAl.save();
    res.status(201).send(apiSerializer(newOpAl, optimizationAlgorithmSerializer));
  } catch (error) {
    winston.error(error.message);
    res.status(500).send(createJSONError('500', 'Error in OptimizationAlgorithm-Router', error.message));
  }
});

/**
 * @swagger
 *
 *  /optimization/algorithms/{id}:
 *    patch:
 *      summary: Update a optimization algorithm with a given ID
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
 *          description: Successfully updated
 */
router.patch('/:algorithmId', async (req: express.Request, res: express.Response) => {
  try {
    const newSettings = await new Deserializer({ keyForAttribute: 'camelCase' }).deserialize(req.body);
    if (req.params.algorithmId !== newSettings.id) {
      throw Error('ObjectId provided in body does not match id in url. Denying update.');
    }

    const optimizationAlgorithm = await OptimizationAlgorithmModel.findById(req.params.algorithmId).exec();
    if (!optimizationAlgorithm) {
      throw Error(`Optimization algorithm with id ${req.params.algorithmId} could not be found.`);
    }
    optimizationAlgorithm.set({
      name: newSettings.name,
      dockerConfig: newSettings.dockerConfig,
    });
    await optimizationAlgorithm.save();
    res.status(200).send();
  } catch (error) {
    winston.error(error.message);
    res.status(500).send(createJSONError('500', 'Error in OptimizationAlgorithm-Router', error.message));
  }
});

/**
 * @swagger
 *
 *  /optimization/algorithms/{id}:
 *    delete:
 *      summary: Delete a optimization algorithm with a given ID
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
 *        '204':
 *          description: Successfully deleted
 */
router.delete('/:algorithmId', async (req: express.Request, res: express.Response) => {
  try {
    const optimizationAlgorithm = await OptimizationAlgorithmModel.findById(req.params.algorithmId).exec();
    if (!optimizationAlgorithm) {
      throw Error(`Optimization algorithm with Id: '${req.params.algorithmId}' not found. Could not be deleted.`);
    }
    await optimizationAlgorithm.remove();
    res.status(204).send();
  } catch (error) {
    winston.error(error.message);
    res.status(500).send(createJSONError('500', 'Error in OptimizationAlgorithm-Router', error.message));
  }
});

export default router;
