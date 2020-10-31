import winston from 'winston';
import { Deserializer } from 'jsonapi-serializer';
import createJSONError from '@/utils/errorSerializer';
import express from 'express';
import eventLogController from '@/controllers/EventLogController';

const router: express.Router = express.Router();

router.post('/', async (req: express.Request, res: express.Response) => {
  try {
    const pathJSON = await new Deserializer({ keyForAttribute: 'camelCase' }).deserialize(req.body);
    if (pathJSON.path) {
      winston.info('Reading eventlog from ' + pathJSON.path);
      const result = await eventLogController.readEventLog(pathJSON.path);
      if (!result) {
        throw Error(`Error while reading eventlog from: ${pathJSON.path} `);
      }
      res.status(204).send();
    }
  } catch (error) {
    winston.error(error.message);
    res.status(500).send(createJSONError('500', 'Error in eventLog-Router', error.message));
  }
});

export default router;
