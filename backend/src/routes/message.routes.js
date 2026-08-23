import { Router } from 'express';
import {
  getStudentThreads,
  getOrCreateThread,
  getThreadDetails,
  sendMessage
} from '../controllers/messageController.js';

const router = Router();

router.get('/threads', getStudentThreads);
router.post('/thread', getOrCreateThread);
router.get('/thread/:threadId', getThreadDetails);
router.get('/thread', getThreadDetails);
router.post('/send', sendMessage);

export default router;
