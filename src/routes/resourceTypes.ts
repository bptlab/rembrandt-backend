import express from 'express';
import ResourceType, { resourceTypeSerializer } from '@/models/ResourceType';
import winston from 'winston';

const router: express.Router = express.Router();

router.get('/', async (req: express.Request, res: express.Response) => {
  try {
    const resourceTypes = await ResourceType.find({}).exec();
    res.send(resourceTypeSerializer.serialize(resourceTypes));
  } catch (error) {
    winston.error(error);
    res.status(500).send(error);
  }
});

export default router;
