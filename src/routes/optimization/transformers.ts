import express from 'express';
import OptimizationTransformerModel, { optimizationTransformerSerializer } from '@/models/OptimizationTransformer';
import { populateResourceTypeOptions } from '@/routes/organization/resourceInstances';
import winston from 'winston';
import { Deserializer } from 'jsonapi-serializer';
import apiSerializer from '@/utils/apiSerializer';
import createJSONError from '@/utils/errorSerializer';
import ResourceInstance from '@/models/ResourceInstance';
import TransformerController from '@/controllers/TransformerController';
import { ResourceType } from '@/models/ResourceType';

const router: express.Router = express.Router();

/**
 * @swagger
 *
 *  /optimization/transformers:
 *    get:
 *      summary: Get list of all optimization transformers
 *      tags:
 *        - OptimizationTransformer
 *      responses:
 *        '200':
 *          description: Successful
 *          content:
 *            application/vnd.api+json:
 *              schema:
 *                $ref: '#/components/schemas/OptimizationTransformersResponse'
 */
router.get('/', async (req: express.Request, res: express.Response) => {
  try {
    const optimizationTransformers = await OptimizationTransformerModel
      .find({})
      .populate(populateResourceTypeOptions)
      .exec();
    res.send(apiSerializer(optimizationTransformers, optimizationTransformerSerializer));
  } catch (error) {
    winston.error(error.message);
    res.status(500).send(createJSONError('500', 'Error in OptimizationTransformer-Router', error.message));
  }
});

/**
 * @swagger
 *
 *  /optimization/transformers/{id}:
 *    get:
 *      summary: Get an optimization transformer by ID
 *      tags:
 *        - OptimizationTransformer
 *      parameters:
 *        - name: id
 *          in: path
 *          description: Optimization Transformer ID
 *          required: true
 *          schema:
 *            type: string
 *      responses:
 *        '200':
 *          description: Successful
 *          content:
 *            application/vnd.api+json:
 *              schema:
 *                $ref: '#/components/schemas/OptimizationTransformerResponse'
 */
router.get('/:transformerId', async (req: express.Request, res: express.Response) => {
  try {
    const optimizationTransformer = await OptimizationTransformerModel
      .findById(req.params.transformerId)
      .populate(populateResourceTypeOptions)
      .exec();
    if (!optimizationTransformer) {
      throw Error(`Optimization transformer with id ${req.params.transformerId} could not be found.`);
    }

    const resourceInstances = await ResourceInstance
      .find({ resourceType: (optimizationTransformer.resourceType as ResourceType)._id })
      .exec();
    const controller = new TransformerController(optimizationTransformer);
    controller.execute(resourceInstances);

    res.send(apiSerializer(optimizationTransformer, optimizationTransformerSerializer));
  } catch (error) {
    winston.error(error.message);
    res.status(500).send(createJSONError('500', 'Error in OptimizationTransformer-Router', error.message));
  }
});

/**
 * @swagger
 *
 *  /optimization/transformers:
 *    post:
 *      summary: Create a new optimization transformer
 *      tags:
 *        - OptimizationTransformer
 *      responses:
 *        '201':
 *          description: Successful
 *          content:
 *            application/vnd.api+json:
 *              schema:
 *                $ref: '#/components/schemas/OptimizationTransformerResponse'
 */
router.post('/', async (req: express.Request, res: express.Response) => {
  try {
    const newTransformerJSON = await new Deserializer({ keyForAttribute: 'camelCase' }).deserialize(req.body);
    if (newTransformerJSON.resourceType.id) {
      newTransformerJSON.resourceType = newTransformerJSON.resourceType.id;
    }
    const newOpAl = new OptimizationTransformerModel(newTransformerJSON);
    await newOpAl.save();
    res.status(201).send(apiSerializer(newOpAl, optimizationTransformerSerializer));
  } catch (error) {
    winston.error(error.message);
    res.status(500).send(createJSONError('500', 'Error in OptimizationTransformer-Router', error.message));
  }
});

/**
 * @swagger
 *
 *  /optimization/transformers/{id}:
 *    patch:
 *      summary: Update the body of an optimization transformer with a given ID
 *      tags:
 *        - OptimizationTransformer
 *      parameters:
 *        - name: id
 *          in: path
 *          description: Optimization Transformer ID
 *          required: true
 *          schema:
 *            type: string
 *      responses:
 *        '200':
 *          description: Successfully updated
 */
router.patch('/:transformerId', async (req: express.Request, res: express.Response) => {
  try {
    const patchedTransformer = await new Deserializer({ keyForAttribute: 'camelCase' }).deserialize(req.body);
    if (req.params.transformerId !== patchedTransformer.id) {
      throw Error('ObjectId provided in body does not match id in url. Denying update.');
    }

    const optimizationTransformer = await OptimizationTransformerModel.findById(req.params.transformerId).exec();
    if (!optimizationTransformer) {
      throw Error(`Optimization transformer with id ${req.params.transformerId} could not be found.`);
    }
    optimizationTransformer.set({
      body: patchedTransformer.body,
    });
    await optimizationTransformer.save();
    res.status(200).send();
  } catch (error) {
    winston.error(error.message);
    res.status(500).send(createJSONError('500', 'Error in OptimizationTransformer-Router', error.message));
  }
});

/**
 * @swagger
 *
 *  /optimization/transformers/{id}:
 *    delete:
 *      summary: Delete an optimization transformer with a given ID
 *      tags:
 *        - OptimizationTransformer
 *      parameters:
 *        - name: id
 *          in: path
 *          description: Optimization Transformer ID
 *          required: true
 *          schema:
 *            type: string
 *      responses:
 *        '204':
 *          description: Successfully deleted
 */
router.delete('/:transformerId', async (req: express.Request, res: express.Response) => {
  try {
    const optimizationTransformer = await OptimizationTransformerModel.findById(req.params.transformerId).exec();
    if (!optimizationTransformer) {
      throw Error(`Optimization transformer with Id: '${req.params.transformerId}' not found. Could not be deleted.`);
    }
    await optimizationTransformer.remove();
    res.status(204).send();
  } catch (error) {
    winston.error(error.message);
    res.status(500).send(createJSONError('500', 'Error in OptimizationTransformer-Router', error.message));
  }
});

export default router;
