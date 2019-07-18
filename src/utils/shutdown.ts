import winston = require('winston');
import DockerController from '@/controllers/DockerController';

export default async function shutdown() {
  winston.info('Shutting down...');
  const dockerController = new DockerController();
  await dockerController.stopAndRemoveAll();
  winston.info('Goodbye!');
}
