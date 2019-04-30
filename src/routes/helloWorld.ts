import express from 'express';
import MessageService from '@/services/HelloWorldService';
import HelloWorldMessage from '@/interfaces/HelloWorldMessage';

const router: express.Router = express.Router();
const messageService: MessageService = new MessageService();

router.get('/', (req: any, res: any) => {
  const helloWorldMessage: HelloWorldMessage = {
    message: 'Hello World',
    sender: 'Bob',
  };

  const message = messageService.helloWorld(helloWorldMessage);

  res.send(message);
});

export default router;
