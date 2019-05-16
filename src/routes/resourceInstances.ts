import express from 'express';
import ResourceInstance, { resourceInstanceSerializer } from '@/models/ResourceInstance';
import winston from 'winston';
import { Deserializer } from 'jsonapi-serializer';
import createJSONError from '@/utils/errorSerializer';

const router: express.Router = express.Router();

  /**
   * @swagger
   *
   *  /resource-instances:
   *    get:
   *      summary: Get list of all resource instances
   *      tags:
   *        - ResourceInstances
   *      responses:
   *        '200':
   *          description: Successful
   *          content:
   *            application/vnd.api+json:
   *              schema:
   *                $ref: '#/components/schemas/ResourceInstancesResponse'
   */
router.get('/', async (req: express.Request, res: express.Response) => {
  try {
    const resourceInstances = await ResourceInstance.find({}).exec();
    res.send(resourceInstanceSerializer.serialize(resourceInstances));
  } catch (error) {
    winston.error(error.message);
    res.status(500).send(createJSONError('500', 'Error in ResourceInstance-Router', error.message));
  }
});

  /**
   * @swagger
   *
   *  /resource-instances/{id}:
   *    get:
   *      summary: Get a resource instance by ID
   *      tags:
   *        - ResourceInstances
   *      parameters:
   *        - name: id
   *          in: path
   *          description: Resource-Instance ID
   *          required: true
   *          schema:
   *            type: string
   *      responses:
   *        '200':
   *          description: Successful
   *          content:
   *            application/vnd.api+json:
   *              schema:
   *                $ref: '#/components/schemas/ResourceInstanceResponse'
   */
router.get('/:instanceId', async (req: express.Request, res: express.Response) => {
  try {
    const resourceInstance = await ResourceInstance.findById(req.params.instanceId).exec();
    res.send(resourceInstanceSerializer.serialize(resourceInstance));
  } catch (error) {
    winston.error(error.message);
    res.status(500).send(createJSONError('500', 'Error in ResourceInstance-Router', error.message));
  }
});

  /**
   * @swagger
   *
   *  /resource-instances:
   *    post:
   *      summary: Create a new resource instance
   *      tags:
   *        - ResourceInstances
   *      responses:
   *        '201':
   *          description: Successful
   *          content:
   *            application/vnd.api+json:
   *              schema:
   *                $ref: '#/components/schemas/ResourceInstanceResponse'
   */
router.post('/', async (req: express.Request, res: express.Response) => {
  try {
    const newInstanceJSON = await new Deserializer({ keyForAttribute: 'camelCase' }).deserialize(req.body);
    const newInstance = new ResourceInstance(newInstanceJSON);
    await newInstance.save();
    res.status(201).send(resourceInstanceSerializer.serialize(newInstance));
  } catch (error) {
    winston.error(error.message);
    res.status(500).send(createJSONError('500', 'Error in ResourceInstance-Router', error.message));
  }
});

  /**
   * @swagger
   *
   *  /resource-instances/{id}:
   *    patch:
   *      summary: Update a resource instance with a given ID
   *      tags:
   *        - ResourceInstances
   *      parameters:
   *        - name: id
   *          in: path
   *          description: Resource-Instance ID
   *          required: true
   *          schema:
   *            type: string
   *      responses:
   *        '200':
   *          description: Successfully updated
   */
router.patch('/:instanceId', async (req: express.Request, res: express.Response) => {
  try {
    const newAttributeValues = await new Deserializer({ keyForAttribute: 'camelCase' }).deserialize(req.body);
    if (req.params.instanceId !== newAttributeValues.id) {
      throw Error('ObjectId provided in body does not match id in url. Denying update.');
    }

    const resourceInstance = await ResourceInstance.findById(req.params.instanceId).exec();
    if (!resourceInstance) {
      throw Error(`Resource instance with id ${req.params.id} could not be found.`);
    }
    resourceInstance.updateFromObject(newAttributeValues);
    await resourceInstance.save();
    res.status(200).send();
  } catch (error) {
    winston.error(error.message);
    res.status(500).send(createJSONError('500', 'Error in ResourceInstance-Router', error.message));
  }
});

  /**
   * @swagger
   *
   *  /resource-instances/{id}:
   *    delete:
   *      summary: Delete a resource instance with a given ID
   *      tags:
   *        - ResourceInstances
   *      parameters:
   *        - name: id
   *          in: path
   *          description: Resource-Instance ID
   *          required: true
   *          schema:
   *            type: string
   *      responses:
   *        '204':
   *          description: Successfully deleted
   */
router.delete('/:instanceId', async (req: express.Request, res: express.Response) => {
  try {
    const resourceInstance = await ResourceInstance.findById(req.params.instanceId).exec();
    if (!resourceInstance) {
      throw Error(`Instance with Id: '${req.params.instanceId}' not found. Could not be deleted.`);
    }
    await resourceInstance.remove();
    res.status(204).send();
  } catch (error) {
    winston.error(error.message);
    res.status(500).send(createJSONError('500', 'Error in ResourceInstance-Router', error.message));
  }
});

export default router;
