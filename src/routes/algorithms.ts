import express from 'express';
import OptimizationAlgorithmModel, { optimizationAlgorithmSerializer } from '@/models/OptimizationAlgorithm';
import winston from 'winston';
import { Deserializer } from 'jsonapi-serializer';
import apiSerializer from '@/utils/apiSerializer';
import createJSONError from '@/utils/errorSerializer';

const router: express.Router = express.Router();

/**
 * @swagger
 *
 *  /resource-types:
 *    get:
 *      summary: Get list of all resource types
 *      tags:
 *        - ResourceTypes
 *      responses:
 *        '200':
 *          description: Successful
 *          content:
 *            application/vnd.api+json:
 *              schema:
 *                $ref: '#/components/schemas/ResourceTypesResponse'
 */
router.get('/', async (req: express.Request, res: express.Response) => {
  try {
    const optimizationAlgorithms = await OptimizationAlgorithmModel.find({}).exec();
    res.send(apiSerializer(optimizationAlgorithms, optimizationAlgorithmSerializer));
  } catch (error) {
    winston.error(error.message);
    res.status(500).send(createJSONError('500', 'Error in OptimizationAlgorithm-Router', error.message));
  }
});

/**
 * @swagger
 *
 *  /resource-types/{id}:
 *    get:
 *      summary: Get a resource type by ID
 *      tags:
 *        - ResourceTypes
 *      parameters:
 *        - name: id
 *          in: path
 *          description: Resource-Type ID
 *          required: true
 *          schema:
 *            type: string
 *      responses:
 *        '200':
 *          description: Successful
 *          content:
 *            application/vnd.api+json:
 *              schema:
 *                $ref: '#/components/schemas/ResourceTypeResponse'
 */
router.get('/:algorithmId', async (req: express.Request, res: express.Response) => {
  try {
    const optimizationAlgorithm = await OptimizationAlgorithmModel.findById(req.params.algorithmId).exec();
    if (!optimizationAlgorithm) {
      throw Error(`Optimization algorithm with id ${req.params.algorithmId} could not be found.`);
    }
    res.send(apiSerializer(optimizationAlgorithm, optimizationAlgorithmSerializer));
  } catch (error) {
    winston.error(error.message);
    res.status(500).send(createJSONError('500', 'Error in OptimizationAlgorithm-Router', error.message));
  }
});

/**
 * @swagger
 *
 *  /resource-types:
 *    post:
 *      summary: Create a new resource type
 *      tags:
 *        - ResourceTypes
 *      responses:
 *        '201':
 *          description: Successful
 *          content:
 *            application/vnd.api+json:
 *              schema:
 *                $ref: '#/components/schemas/ResourceTypeResponse'
 */
router.post('/', async (req: express.Request, res: express.Response) => {
  try {
    const newOpAlJSON = await new Deserializer({ keyForAttribute: 'camelCase' }).deserialize(req.body);
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
 *  /resource-types/{id}:
 *    patch:
 *      summary: Update a resource type with a given ID
 *      tags:
 *        - ResourceTypes
 *      parameters:
 *        - name: id
 *          in: path
 *          description: Resource-Type ID
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
    optimizationAlgorithm.set(newSettings);
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
 *  /resource-types/{id}:
 *    delete:
 *      summary: Delete a resource type with a given ID
 *      tags:
 *        - ResourceTypes
 *      parameters:
 *        - name: id
 *          in: path
 *          description: Resource-Type ID
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
