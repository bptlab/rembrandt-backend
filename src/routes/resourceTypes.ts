import express from 'express';
import ResourceType, { resourceTypeSerializer } from '@/models/ResourceType';
import winston from 'winston';
import { Deserializer } from 'jsonapi-serializer';
import createJSONError from '@/utils/errorSerializer';

const router: express.Router = express.Router();

router.get('/', async (req: express.Request, res: express.Response) => {
  try {
    const resourceTypes = await ResourceType.find({}).exec();
    res.send(resourceTypeSerializer.serialize(resourceTypes));
  } catch (error) {
    winston.error(error.message);
    res.status(500).send(createJSONError('500', 'Error in ResourceType-Router', error.message));
  }
});

router.post('/', async (req: express.Request, res: express.Response) => {
  try {
    const newResourceTypeJSON = await new Deserializer({ keyForAttribute: 'camelCase' }).deserialize(req.body);
    const newResourceType = new ResourceType(newResourceTypeJSON);
    await newResourceType.save();
    res.status(201).send(resourceTypeSerializer.serialize(newResourceType));
  } catch (error) {
    winston.error(error.message);
    res.status(500).send(createJSONError('500', 'Error in ResourceType-Router', error.message));
  }
});

router.get('/:typeId', async (req: express.Request, res: express.Response) => {
  try {
    const resourceType = await ResourceType.findById(req.params.typeId).exec();
    res.send(resourceTypeSerializer.serialize(resourceType));
  } catch (error) {
    winston.error(error.message);
    res.status(500).send(createJSONError('500', 'Error in ResourceType-Router', error.message));
  }
});

router.patch('/:typeId', async (req: express.Request, res: express.Response) => {
  try {
    const newAttributeValues = await new Deserializer({ keyForAttribute: 'camelCase' }).deserialize(req.body);
    if (req.params.typeId !== newAttributeValues.id) {
      throw Error('ObjectId provided in body does not match id in url. Denying update.');
    }
    delete newAttributeValues.id;

    await ResourceType.findByIdAndUpdate(req.params.typeId, newAttributeValues).exec();
    res.status(202).send();
  } catch (error) {
    winston.error(error.message);
    res.status(500).send(createJSONError('500', 'Error in ResourceType-Router', error.message));
  }
});

router.delete('/:typeId', async (req: express.Request, res: express.Response) => {
  try {
    const resourceType = await ResourceType.findById(req.params.typeId).exec();
    if (!resourceType) {
      throw Error(`Resource Type with Id: '${req.params.typeId}' not found. Could not be deleted.`);
    }
    await resourceType.remove();
    res.status(202).send();
  } catch (error) {
    winston.error(error.message);
    res.status(500).send(createJSONError('500', 'Error in ResourceType-Router', error.message));
  }
});

export default router;
