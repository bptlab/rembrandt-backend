import winston from 'winston';
import { Deserializer } from 'jsonapi-serializer';
import { Serializer } from 'jsonapi-serializer';
import apiSerializer from '@/utils/apiSerializer';
import createJSONError from '@/utils/errorSerializer';
import express from 'express';
import allocationLogger from '@/utils/allocationLogger';

const router: express.Router = express.Router();

router.get('/:sqlQuery', async (req: express.Request, res: express.Response) => {
  try {
    const result = await allocationLogger.queryAllocationLog(req.params.sqlQuery);
    if (!result) {
      throw Error(`SQL query could not be processed: ${req.params.sqlQuery} `);
    }
    res.send(result);
  } catch (error) {
    winston.error(error.message);
    res.status(500).send(createJSONError('500', 'Error in Metrics-Router', error.message));
  }
});
