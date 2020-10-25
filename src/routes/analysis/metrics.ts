import winston from 'winston';
import { Deserializer } from 'jsonapi-serializer';
import createJSONError from '@/utils/errorSerializer';
import express from 'express';
import allocationLogger from '@/utils/allocationLogger';

var JSONAPISerializer = require("json-api-serializer");
var NewSerializer = new JSONAPISerializer({
  convertCase: "camelCase",
});
NewSerializer.register("metricResult", {
    id: "id",
});

const router: express.Router = express.Router();

router.post('/', async (req: express.Request, res: express.Response) => {
  try {
    const queryJSON = await new Deserializer({ keyForAttribute: 'camelCase' }).deserialize(req.body);
    console.log(queryJSON);
    if (queryJSON.query) {
      console.log(queryJSON.query);
      const result = await allocationLogger.queryDatabase(queryJSON.query);
      if (!result) {
        throw Error(`SQL query could not be processed: ${queryJSON.query} `);
      }
      res.send(NewSerializer.serialize('metricResult', result));
    }
  } catch (error) {
    winston.error(error.message);
    res.status(500).send(createJSONError('500', 'Error in Metrics-Router', error.message));
  }
});

export default router;