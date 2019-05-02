import express from 'express';
import MessageService from '@/services/HelloWorldService';
import HelloWorldMessageModel from '@/models/HelloWorldMessageModel';

const router: express.Router = express.Router();
const messageService: MessageService = new MessageService();

router.get('/', (req: express.Request, res: express.Response) => {
  const helloWorldMessage = new HelloWorldMessageModel ({
    message: 'Hello World',
    sender: 'Bob',
  });

  const message = messageService.helloWorld(helloWorldMessage);

  res.send(message);
});

export default router;
