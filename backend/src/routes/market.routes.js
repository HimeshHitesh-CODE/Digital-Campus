import { Router } from 'express';
import {
  getMarketplaceItems,
  createMarketplaceItem,
  getItemChatMessages,
  postItemChatMessage
} from '../controllers/marketplaceController.js';

const router = Router();

router.get('/items', getMarketplaceItems);
router.post('/items', createMarketplaceItem);

router.get('/items/:itemId/chat', getItemChatMessages);
router.post('/items/:itemId/chat', postItemChatMessage);

router.get('/chat', getItemChatMessages);
router.post('/chat', postItemChatMessage);

export default router;
