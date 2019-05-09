import express from 'express';
import ResourceType, { resourceTypeSerializer } from '@/models/ResourceType';
import winston from 'winston';
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

router.get('/:typeId', async (req: express.Request, res: express.Response) => {
  try {
    const resourceType = await ResourceType.findById(req.params.typeId).exec();
    res.send(resourceTypeSerializer.serialize(resourceType));
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
