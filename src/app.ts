import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import swaggerUi from 'swagger-ui-express';
import cors from 'cors';
import helloWorldRouter from '@/routes/helloWorld';
import resourceTypeRouter from '@/routes/resourceTypes';
import RootTypeInitializer from '@/utils/RootTypeInitializer';
import ResourceInstanceInitializer from '@/utils/ResourceInstanceInitializer';

const swaggerConfig = require('@/swagger.json');

async function startApiServer() {
  const app: express.Application = express();
  const port: string = process.env.PORT || '3000';

  app.use(bodyParser.urlencoded({extended: true}));
  app.use(bodyParser.json());
  app.use(cors());
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerConfig));

  app.use('/hello-world', helloWorldRouter);
  app.use('/resource-types', resourceTypeRouter);

  app.get('/', (req: express.Request, res: express.Response) => {
    res.send('hello world!');
  });

  app.listen(port);

  await RootTypeInitializer.initializeRootTypes();
  await ResourceInstanceInitializer.initializeResourceInstances();
}

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', startApiServer);

mongoose.connect(`mongodb://${process.env.MONGO_HOST || 'localhost'}/rembrandt`, { useNewUrlParser: true });
