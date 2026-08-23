/**
 * Unified Messaging Controller
 * Manages real-time threads and messages across Idea Hub Collaborations and Marketplace Exchanges.
 */

// In-memory Thread & Message Stores
const unifiedThreads = new Map();
const threadMessages = new Map();

/**
 * Helper to generate or find existing thread ID for two PINs and context
 */
function getThreadKey(pin1, pin2, contextType = 'COLLAB', contextId = '') {
  const sortedPins = [pin1.toUpperCase(), pin2.toUpperCase()].sort().join('_');
  return `th_${sortedPins}_${contextType}_${contextId || 'general'}`;
}

/**
 * Get all conversation threads for a student PIN
 */
export const getStudentThreads = (req, res) => {
  const pin = (req.query.pin || req.user?.sbtetPin || req.user?.rollNumber || '').trim().toUpperCase();

  if (!pin) {
    return res.status(200).json({ success: true, threads: [] });
  }

  const userThreads = [];
  for (const thread of unifiedThreads.values()) {
    if (thread.participants.includes(pin)) {
      // Format thread for the requesting user
      const otherPin = thread.participants.find(p => p !== pin) || pin;
      const otherUser = thread.participantDetails[otherPin] || { name: 'Campus Peer', pin: otherPin };
      const msgs = threadMessages.get(thread.id) || [];
      const lastMsg = msgs[msgs.length - 1];

      userThreads.push({
        ...thread,
        peer: otherUser,
        lastMessage: lastMsg ? lastMsg.text : thread.lastMessage || 'Conversation started.',
        lastTime: lastMsg ? lastMsg.time : thread.lastTime || '',
        unread: lastMsg && lastMsg.senderPin !== pin ? 1 : 0
      });
    }
  }

  // Sort by latest update descending
  userThreads.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());

  return res.status(200).json({
    success: true,
    threads: userThreads
  });
};

/**
 * Get or Create a conversation thread
 */
export const getOrCreateThread = (req, res) => {
  const { senderPin, senderName, senderBranch, peerPin, peerName, peerBranch, type, contextTitle, itemId, collabId, price } = req.body;

  const activeSenderPin = (senderPin || req.user?.sbtetPin || req.user?.rollNumber || 'STUDENT_A').trim().toUpperCase();
  const activePeerPin = (peerPin || 'STUDENT_B').trim().toUpperCase();
  const contextType = (type || 'COLLAB').toUpperCase();
  const contextId = itemId || collabId || '';

  const threadId = getThreadKey(activeSenderPin, activePeerPin, contextType, contextId);

  if (!unifiedThreads.has(threadId)) {
    const newThread = {
      id: threadId,
      type: contextType, // 'COLLAB' or 'MARKET'
      participants: [activeSenderPin, activePeerPin],
      participantDetails: {
        [activeSenderPin]: {
          pin: activeSenderPin,
          name: senderName || req.user?.name || 'Student',
          branch: senderBranch || req.user?.department || 'Diploma Engineering'
        },
        [activePeerPin]: {
          pin: activePeerPin,
          name: peerName || 'Campus Peer',
          branch: peerBranch || 'Computer Science & Engineering'
        }
      },
      context: {
        title: contextTitle || (contextType === 'MARKET' ? 'Marketplace Listing' : 'Project Collaboration'),
        tag: contextType,
        itemId,
        collabId,
        price
      },
      lastMessage: 'Conversation initialized.',
      lastTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      lastUpdated: new Date().toISOString()
    };

    unifiedThreads.set(threadId, newThread);
    threadMessages.set(threadId, [
      {
        id: `msg_${Date.now()}`,
        senderPin: 'SYSTEM',
        senderName: 'Samskruti Messenger',
        text: contextType === 'MARKET'
          ? `Exchange thread opened for "${contextTitle || 'Item'}"${price ? ` (₹${price})` : ''}. Connect for campus handover.`
          : `Collaboration thread started for "${contextTitle || 'Project Idea'}". Discuss roles & milestones.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        createdAt: new Date().toISOString(),
        isSystem: true
      }
    ]);
  }

  const thread = unifiedThreads.get(threadId);
  const messages = threadMessages.get(threadId) || [];

  return res.status(200).json({
    success: true,
    thread,
    messages
  });
};

/**
 * Get messages for a specific thread ID
 */
export const getThreadDetails = (req, res) => {
  const threadId = req.params.threadId || req.query.threadId;

  if (!threadId || !unifiedThreads.has(threadId)) {
    return res.status(404).json({ success: false, message: 'Conversation thread not found.' });
  }

  const thread = unifiedThreads.get(threadId);
  const messages = threadMessages.get(threadId) || [];

  return res.status(200).json({
    success: true,
    thread,
    messages
  });
};

/**
 * Send a message into a thread
 */
export const sendMessage = (req, res) => {
  const { threadId, senderPin, senderName, text } = req.body;

  if (!threadId || !text) {
    return res.status(400).json({ success: false, message: 'threadId and message text are required.' });
  }

  const thread = unifiedThreads.get(threadId);
  if (!thread) {
    return res.status(404).json({ success: false, message: 'Thread does not exist.' });
  }

  const cleanPin = (senderPin || req.user?.sbtetPin || req.user?.rollNumber || 'STUDENT').trim().toUpperCase();
  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const newMsg = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    threadId,
    senderPin: cleanPin,
    senderName: senderName || req.user?.name || 'Student',
    text: text.trim(),
    time: timeStr,
    createdAt: new Date().toISOString()
  };

  if (!threadMessages.has(threadId)) {
    threadMessages.set(threadId, []);
  }

  threadMessages.get(threadId).push(newMsg);

  // Update thread last message & timestamp
  thread.lastMessage = text.trim();
  thread.lastTime = timeStr;
  thread.lastUpdated = new Date().toISOString();

  return res.status(201).json({
    success: true,
    message: 'Message sent successfully.',
    msg: newMsg
  });
};
