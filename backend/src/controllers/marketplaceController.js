/**
 * Marketplace Controller
 * Handles verified student item listings, uploads, and real-time buyer-seller messaging threads.
 */

// In-memory marketplace items store (Clean state: starts empty and persists dynamic student listings)
const marketplaceItems = [];

// In-memory buyer-seller chat messages per item
const itemChatThreads = new Map();

/**
 * Get all active marketplace listings
 */
export const getMarketplaceItems = (req, res) => {
  const category = req.query.category;
  let items = marketplaceItems;

  if (category && category !== 'ALL') {
    items = items.filter(i => i.category === category);
  }

  return res.status(200).json({
    success: true,
    items
  });
};

/**
 * Post a new surplus item
 */
export const createMarketplaceItem = (req, res) => {
  const { title, category, price, condition, description, image, sellerName, sellerPin, sellerBranch } = req.body;

  if (!title || !price) {
    return res.status(400).json({ success: false, message: 'Item title and price are required.' });
  }

  const newItem = {
    id: `item_${Date.now()}`,
    title,
    category: category || 'TEXTBOOK',
    price: parseFloat(price) || 0,
    condition: condition || 'Good Condition',
    description: description || 'No additional details provided.',
    image: image || null,
    sellerName: sellerName || req.user?.name || 'Student Seller',
    sellerPin: (sellerPin || req.user?.sbtetPin || req.user?.rollNumber || 'Student').trim().toUpperCase(),
    sellerBranch: sellerBranch || req.user?.department || 'Engineering',
    createdAt: new Date().toISOString()
  };

  marketplaceItems.unshift(newItem);

  return res.status(201).json({
    success: true,
    message: 'Item listed successfully in Marketplace.',
    item: newItem
  });
};

/**
 * Get chat messages for an item
 */
export const getItemChatMessages = (req, res) => {
  const itemId = req.params.itemId || req.query.itemId;
  if (!itemId) {
    return res.status(200).json({ success: true, messages: [] });
  }

  const messages = itemChatThreads.get(itemId) || [];

  return res.status(200).json({
    success: true,
    messages
  });
};

/**
 * Send a chat message on an item listing
 */
export const postItemChatMessage = (req, res) => {
  const itemId = req.params.itemId || req.body.itemId;
  const { text, senderPin, senderName } = req.body;

  if (!itemId || !text) {
    return res.status(400).json({ success: false, message: 'itemId and message text are required.' });
  }

  const newMsg = {
    senderPin: senderPin || req.user?.sbtetPin || req.user?.rollNumber || 'Student',
    senderName: senderName || req.user?.name || 'Student',
    text,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  if (!itemChatThreads.has(itemId)) {
    itemChatThreads.set(itemId, []);
  }

  itemChatThreads.get(itemId).push(newMsg);

  return res.status(201).json({
    success: true,
    message: 'Message delivered to seller.',
    msg: newMsg
  });
};
