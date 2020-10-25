import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import swaggerUi from 'swagger-ui-express';
import cors from 'cors';
import resourceTypeRouter from '@/routes/organization/resourceTypes';
import resourceInstanceRouter from '@/routes/organization/resourceInstances';
import optimizationAlgorithmRouter from '@/routes/optimization/algorithms';
import optimizationExecutionRouter from '@/routes/optimization/executions';
import optimizationTransformerRouter from '@/routes/optimization/transformers';
import optimizationRecipeRouter from '@/routes/optimization/recipes';
import analysisRouter from '@/routes/analysis/metrics';
import RootTypeInitializer from '@/utils/RootTypeInitializer';
import ResourceInstanceInitializer from '@/utils/ResourceInstanceInitializer';
import createJSONError from '@/utils/errorSerializer';
import config from '@/config.json';
import shutdown from '@/utils/shutdown';
import allocationLogger from '@/utils/allocationLogger';

// tslint:disable-next-line: no-var-requires
const swaggerConfig = require('@/swagger.json');
const contentType: string = 'application/vnd.api+json';

function enforceContentType(req: express.Request, res: express.Response, next: express.NextFunction): void {
  if (!req.headers || req.headers['content-type'] !== contentType) {
    res.status(415).send(createJSONError(
      '415',
      'Unsupported Media Type',
      `Only requests specifying '${contentType}' as content type are allowed.`,
    ));
  }
  next();
}

async function startApiServer(): Promise<void> {
  const app: express.Application = express();
  const port: string = process.env.PORT || '3000';

  app.use(bodyParser.urlencoded({extended: true}));
  app.use(bodyParser.json({ type:  contentType}));
  app.use(cors());
  app.use(express.static('public'));

  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerConfig));

  app.use('/api', enforceContentType);

  app.use('/api/organization/resource-types', resourceTypeRouter);
  app.use('/api/organization/resource-instances', resourceInstanceRouter);

  app.use('/api/optimization/algorithms', optimizationAlgorithmRouter);
  app.use('/api/optimization/executions', optimizationExecutionRouter);
  app.use('/api/optimization/transformers', optimizationTransformerRouter);
  app.use('/api/optimization/recipes', optimizationRecipeRouter);
  app.use('/api/analysis/metrics', analysisRouter);

  app.listen(port);

  if (config.resourceTypeInitializer.enable) {
    await RootTypeInitializer.initializeRootTypes();
  }
  if (config.resourceInstanceInitializer.enable) {
    await ResourceInstanceInitializer.initializeResourceInstances();
  }
}

const db = mongoose.connection;
// tslint:disable-next-line: no-console
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', startApiServer);

mongoose.connect(`mongodb://${process.env.MONGO_HOST || 'localhost'}/rembrandt`, { useNewUrlParser: true });

// mysql connection

(async () => {
  await allocationLogger.createAllocationLogConnection();
 // await allocationLogger.saveInEventAllocationLog('testres', 'SMile Tour Planning - Rule', 'mymy');
 // await allocationLogger.setDuration(2,10);
  await allocationLogger.queryDatabase('select * from allocation_log where Requester = "mymy";');
})();

process.on('SIGINT', async () => {
  await shutdown();
  process.exit(0);
});
