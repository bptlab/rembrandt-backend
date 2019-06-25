import winston = require('winston');
import OptimizationManager from '@/controllers/OptimizationManager';

export default async function shutdown() {
  winston.info('Shutting down...');
  const optimizationManager = new OptimizationManager();
  await optimizationManager.stopAndRemoveAll();
  winston.info('Goodbye!');
}
