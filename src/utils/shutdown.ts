import winston = require('winston');
import OptimizationExecution from '@/controllers/docker';

export default async function shutdown() {
  winston.info('Shutting down...');
  const optimizationExecution = new OptimizationExecution();
  await optimizationExecution.stopAndRemoveAll();
  winston.info('Goodbye!');
}
