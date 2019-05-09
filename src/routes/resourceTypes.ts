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

export default router;
