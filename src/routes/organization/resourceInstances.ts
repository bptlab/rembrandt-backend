import express from 'express';
import ResourceInstance, { resourceInstanceSerializer } from '@/models/ResourceInstance';
import winston from 'winston';
import { Deserializer } from 'jsonapi-serializer';
import apiSerializer from '@/utils/apiSerializer';
import createJSONError from '@/utils/errorSerializer';

const router: express.Router = express.Router();

export const populateResourceTypeOptions = {
  path: 'resourceType',
  model: 'ResourceType',
};

/**
 * @swagger
 *
 *  /organization/resource-instances:
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
    const resourceInstances = await ResourceInstance
      .find({})
      .populate(populateResourceTypeOptions)
      .exec();
    res.send(apiSerializer(resourceInstances, resourceInstanceSerializer));
  } catch (error) {
    winston.error(error.message);
    res.status(500).send(createJSONError('500', 'Error in ResourceInstance-Router', error.message));
  }
});

/**
 * @swagger
 *
 *  /organization/resource-instances/{id}:
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
    const resourceInstance = await ResourceInstance
      .findById(req.params.instanceId)
      .populate(populateResourceTypeOptions)
      .exec();
    res.send(apiSerializer(resourceInstance, resourceInstanceSerializer));
  } catch (error) {
    winston.error(error.message);
    res.status(500).send(createJSONError('500', 'Error in ResourceInstance-Router', error.message));
  }
});

/**
 * @swagger
 *
 *  /organization/resource-instances:
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
    if (newInstanceJSON.resourceType.id) {
      newInstanceJSON.resourceType = newInstanceJSON.resourceType.id;
    }
    const newInstance = new ResourceInstance(newInstanceJSON);
    await newInstance.save();
    res.status(201).send(apiSerializer(newInstance, resourceInstanceSerializer));
  } catch (error) {
    winston.error(error.message);
    res.status(500).send(createJSONError('500', 'Error in ResourceInstance-Router', error.message));
  }
});

/**
 * @swagger
 *
 *  /organization/resource-instances/{id}:
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
 *        '204':
 *          description: Successfully updated
 */
router.patch('/:instanceId', async (req: express.Request, res: express.Response) => {
  try {
    const updatedInstance = await new Deserializer({ keyForAttribute: 'camelCase' }).deserialize(req.body);
    if (req.params.instanceId !== updatedInstance.id) {
      throw Error('ObjectId provided in body does not match id in url. Denying update.');
    }

    const resourceInstance = await ResourceInstance.findById(req.params.instanceId).exec();
    if (!resourceInstance) {
      throw Error(`Resource instance with id ${req.params.id} could not be found.`);
    }
    resourceInstance.set({ attributes: updatedInstance.attributes });
    await resourceInstance.save();
    res.status(204).send();
  } catch (error) {
    winston.error(error.message);
    res.status(500).send(createJSONError('500', 'Error in ResourceInstance-Router', error.message));
  }
});

/**
 * @swagger
 *
 *  /organization/resource-instances/{id}:
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
