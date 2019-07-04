import winston = require('winston');
import AlgorithmController from '@/controllers/AlgorithmController';

export default async function shutdown() {
  winston.info('Shutting down...');
  const algorithmController = new AlgorithmController();
  await algorithmController.stopAndRemoveAll();
  winston.info('Goodbye!');
}
