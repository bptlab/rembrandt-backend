import express from 'express';
import ResourceType from '@/models/ResourceType';
import ResourceTypeSerializer from '@/models/ResourceTypeSerializer';
import winston from 'winston';

const router: express.Router = express.Router();

router.get('/', async (req: express.Request, res: express.Response) => {
  try {
    const resourceTypes = await ResourceType.find({}).exec();
    res.send(ResourceTypeSerializer.serialize(resourceTypes));
  } catch (error) {
    winston.error(error);
    res.status(500).send(error);
  }
});

export default router;
