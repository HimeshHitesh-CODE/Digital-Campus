import { Router } from 'express';
import {
  getAllPeerSkills,
  getMySkills,
  updateMySkills,
  sendCollaborationRequest,
  getCollaborationRequests,
  respondToCollaboration,
  getThreadMessages,
  postThreadMessage
} from '../controllers/collaborationController.js';

const router = Router();

router.get('/skills', getAllPeerSkills);
router.get('/my-skills', getMySkills);
router.post('/skills', updateMySkills);

router.post('/request', sendCollaborationRequest);
router.get('/requests', getCollaborationRequests);
router.post('/respond', respondToCollaboration);

router.get('/messages', getThreadMessages);
router.post('/messages', postThreadMessage);

export default router;
