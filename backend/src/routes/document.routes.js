import { Router } from 'express';
import { getStudentDocRequests, submitDocRequest } from '../controllers/documentController.js';

const router = Router();

router.get('/', getStudentDocRequests);
router.get('/requests', getStudentDocRequests);
router.post('/request', submitDocRequest);
router.post('/requests', submitDocRequest);
router.post('/', submitDocRequest);

export default router;
