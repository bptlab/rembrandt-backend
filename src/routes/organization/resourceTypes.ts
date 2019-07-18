import express from 'express';
import ResourceTypeModel, { resourceTypeSerializer } from '@/models/ResourceType';
import winston from 'winston';
import { Deserializer } from 'jsonapi-serializer';
import apiSerializer from '@/utils/apiSerializer';
import createJSONError from '@/utils/errorSerializer';

const router: express.Router = express.Router();

const populateParentTypeOptions = {
  path: 'parentType',
  model: 'ResourceType',
};

/**
 * @swagger
 *
 *  /organization/resource-types:
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
    const resourceTypes = await ResourceTypeModel
      .find({})
      .populate(populateParentTypeOptions)
      .exec();
    for (const resourceType of resourceTypes) {
      resourceType.attributes = await resourceType.getCompleteListOfAttributes();
    }
    res.send(apiSerializer(resourceTypes, resourceTypeSerializer));
  } catch (error) {
    winston.error(error.message);
    res.status(500).send(createJSONError('500', 'Error in ResourceType-Router', error.message));
  }
});

/**
 * @swagger
 *
 *  /organization/resource-types/{id}:
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
router.get('/:typeId', async (req: express.Request, res: express.Response) => {
  try {
    const resourceType = await ResourceTypeModel
      .findById(req.params.typeId)
      .populate(populateParentTypeOptions)
      .exec();
    if (!resourceType) {
      throw Error(`Resource type with id ${req.params.id} could not be found.`);
    }
    resourceType.attributes = await resourceType.getCompleteListOfAttributes();
    res.send(apiSerializer(resourceType, resourceTypeSerializer));
  } catch (error) {
    winston.error(error.message);
    res.status(500).send(createJSONError('500', 'Error in ResourceType-Router', error.message));
  }
});

/**
 * @swagger
 *
 *  /organization/resource-types:
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
    const newResourceTypeJSON = await new Deserializer({ keyForAttribute: 'camelCase' }).deserialize(req.body);
    if (newResourceTypeJSON.parentType.id) {
      newResourceTypeJSON.parentType = newResourceTypeJSON.parentType.id;
    }
    const newResourceType = new ResourceTypeModel(newResourceTypeJSON);
    await newResourceType.save();
    res.status(201).send(apiSerializer(newResourceType, resourceTypeSerializer));
  } catch (error) {
    winston.error(error.message);
    res.status(500).send(createJSONError('500', 'Error in ResourceType-Router', error.message));
  }
});

/**
 * @swagger
 *
 *  /organization/resource-types/{id}:
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
 *        '204':
 *          description: Successfully updated
 */
router.patch('/:typeId', async (req: express.Request, res: express.Response) => {
  try {
    const newAttributeValues = await new Deserializer({ keyForAttribute: 'camelCase' }).deserialize(req.body);
    if (req.params.typeId !== newAttributeValues.id) {
      throw Error('ObjectId provided in body does not match id in url. Denying update.');
    }

    const resourceType = await ResourceTypeModel.findById(req.params.typeId).exec();
    if (!resourceType) {
      throw Error(`Resource type with id ${req.params.id} could not be found.`);
    }
    resourceType.set(newAttributeValues);
    await resourceType.save();
    res.status(204).send();
  } catch (error) {
    winston.error(error.message);
    res.status(500).send(createJSONError('500', 'Error in ResourceType-Router', error.message));
  }
});

/**
 * @swagger
 *
 *  /organization/resource-types/{id}:
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
router.delete('/:typeId', async (req: express.Request, res: express.Response) => {
  try {
    const resourceType = await ResourceTypeModel.findById(req.params.typeId).exec();
    if (!resourceType) {
      throw Error(`Resource Type with Id: '${req.params.typeId}' not found. Could not be deleted.`);
    }
    await resourceType.remove();
    res.status(204).send();
  } catch (error) {
    winston.error(error.message);
    res.status(500).send(createJSONError('500', 'Error in ResourceType-Router', error.message));
  }
});

export default router;
