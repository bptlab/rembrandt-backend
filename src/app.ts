import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import swaggerUi from 'swagger-ui-express';
import cors from 'cors';
import resourceTypeRouter from '@/routes/resourceTypes';
import resourceInstanceRouter from '@/routes/resourceInstances';
import optimizationAlgorithmRouter from '@/routes/algorithms';
import RootTypeInitializer from '@/utils/RootTypeInitializer';
import ResourceInstanceInitializer from '@/utils/ResourceInstanceInitializer';
import createJSONError from '@/utils/errorSerializer';
import config from '@/config.json';

// tslint:disable-next-line: no-var-requires
const swaggerConfig = require('@/swagger.json');
const contentType: string = 'application/vnd.api+json';

function enforceContentType(req: express.Request, res: express.Response, next: express.NextFunction): void {
  if (req.originalUrl.startsWith('/docs')) {
    next();
    return;
  }

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
  app.use('/', enforceContentType);
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerConfig));

  app.use('/resource-types', resourceTypeRouter);
  app.use('/resource-instances', resourceInstanceRouter);

  app.use('/optimization-algorithms', optimizationAlgorithmRouter);

  app.get('/', (req: express.Request, res: express.Response) => {
    res.send('hello world!');
  });

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
