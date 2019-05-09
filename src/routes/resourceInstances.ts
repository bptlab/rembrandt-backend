import express from 'express';
import ResourceInstance, { resourceInstanceSerializer } from '@/models/ResourceInstance';
import winston from 'winston';
import createJSONError from '@/utils/errorSerializer';

const router: express.Router = express.Router();

router.get('/', async (req: express.Request, res: express.Response) => {
  try {
    const resourceInstances = await ResourceInstance.find({}).exec();
    res.send(resourceInstanceSerializer.serialize(resourceInstances));
  } catch (error) {
    winston.error(error.message);
    res.status(500).send(createJSONError('500', 'Error in ResourceInstance-Router', error.message));
  }
});

export default router;
